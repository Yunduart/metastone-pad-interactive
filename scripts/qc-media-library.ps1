param(
  [string]$SyncReport = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $SyncReport) {
  $SyncReport = Join-Path $projectRoot "media-build\latest-media\media-sync-report.json"
}
$qcReport = Join-Path (Split-Path -Parent $SyncReport) "media-qc.json"

function Resolve-FfmpegTool([string]$Name) {
  $command = Get-Command "$Name.exe" -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $packageRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  $found = Get-ChildItem -LiteralPath $packageRoot -Filter "$Name.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { return $found.FullName }
  throw "$Name was not found. Install Gyan.FFmpeg before media QC."
}

$ffprobe = Resolve-FfmpegTool "ffprobe"
$ffmpeg = Resolve-FfmpegTool "ffmpeg"
$sync = Get-Content -LiteralPath $SyncReport -Raw -Encoding UTF8 | ConvertFrom-Json
$results = [System.Collections.Generic.List[object]]::new()
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($item in $sync.items) {
  $probe = & $ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,r_frame_rate -show_entries format=duration,size -of json $item.target | ConvertFrom-Json
  $video = $probe.streams | Where-Object codec_type -eq "video" | Select-Object -First 1
  $audio = $probe.streams | Where-Object codec_type -eq "audio" | Select-Object -First 1
  $duration = [double]$probe.format.duration
  $checks = [ordered]@{
    filePresent = Test-Path -LiteralPath $item.target -PathType Leaf
    codecH264 = $video.codec_name -eq "h264"
    resolutionValid = $video.width -ge 1920 -and $video.height -ge 1080
    durationValid = $duration -gt 0
    gifMotionValid = $null
  }
  $frameHashes = @()

  if ($item.containsAnimatedGif) {
    $sampleTimes = @(0.45, ($duration * 0.2), ($duration * 0.4), ($duration * 0.6), ($duration * 0.8))
    foreach ($time in $sampleTimes) {
      $frameHashes += ((& $ffmpeg -v error -ss ([string]::Format([Globalization.CultureInfo]::InvariantCulture, "{0:0.000}", $time)) -i $item.target -frames:v 1 -f md5 - 2>$null) -replace "^MD5=", "")
    }
    $checks.gifMotionValid = @($frameHashes | Sort-Object -Unique).Count -ge 4
  }

  $passed = -not ($checks.Values -contains $false)
  if (-not $passed) { $failures.Add($item.relativeTarget) }
  $results.Add([pscustomobject]@{
    topic = $item.topic
    title = $item.title
    file = $item.relativeTarget
    kind = $item.kind
    codec = $video.codec_name
    width = $video.width
    height = $video.height
    fps = $video.r_frame_rate
    durationSeconds = $duration
    hasAudio = [bool]$audio
    containsAnimatedGif = [bool]$item.containsAnimatedGif
    distinctGifSampleFrames = if ($item.containsAnimatedGif) { @($frameHashes | Sort-Object -Unique).Count } else { $null }
    checks = $checks
    passed = $passed
  })
}

$qc = [ordered]@{
  schema = "metastone-media-qc/1"
  generatedAt = (Get-Date).ToString("o")
  syncReport = $SyncReport
  ffprobe = $ffprobe
  total = $results.Count
  passed = @($results | Where-Object passed).Count
  failed = @($results | Where-Object { -not $_.passed }).Count
  gifSlides = @($results | Where-Object containsAnimatedGif).Count
  failures = $failures
  items = $results
}
$qc | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $qcReport -Encoding UTF8

Write-Output ("MEDIA_QC_REPORT=" + $qcReport)
Write-Output ("MEDIA_QC=$($qc.passed)/$($qc.total) PASS")
Write-Output ("GIF_MOTION_QC=" + (($results | Where-Object containsAnimatedGif | ForEach-Object { "$($_.topic):$($_.distinctGifSampleFrames)-distinct-frames" }) -join ","))
if ($qc.failed -gt 0) {
  throw "Media QC failed: $($failures -join ', ')"
}
