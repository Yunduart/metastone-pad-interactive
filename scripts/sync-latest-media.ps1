param(
  [string]$CaseSourceRoot = "D:\FOR_WORK\260818_MetaStone\0824案例介绍",
  [string]$ProductSourceRoot = "D:\FOR_WORK\260818_MetaStone\0817是石科技产品视频互动展示",
  [switch]$ForcePptExport
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$videoRoot = Join-Path $projectRoot "public\videos"
$buildRoot = Join-Path $projectRoot "media-build\latest-media"
$slideDeckRoot = Join-Path $buildRoot "one-slide-decks"
$reportPath = Join-Path $buildRoot "media-sync-report.json"

[System.IO.Directory]::CreateDirectory($videoRoot) | Out-Null
[System.IO.Directory]::CreateDirectory($slideDeckRoot) | Out-Null

$records = [System.Collections.Generic.List[object]]::new()

function Get-FileSha256([string]$Path) {
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Assert-SourceFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing source file: $Path"
  }
}

function Copy-MediaFile {
  param(
    [string]$Source,
    [string]$RelativeTarget,
    [string]$Catalog,
    [string]$Topic,
    [string]$Title
  )

  Assert-SourceFile $Source
  $target = Join-Path $videoRoot $RelativeTarget
  [System.IO.Directory]::CreateDirectory((Split-Path -Parent $target)) | Out-Null
  $sourceHash = Get-FileSha256 $Source
  $copyRequired = $true
  if (Test-Path -LiteralPath $target -PathType Leaf) {
    $copyRequired = (Get-FileSha256 $target) -ne $sourceHash
  }
  if ($copyRequired) {
    Copy-Item -LiteralPath $Source -Destination $target -Force
  }
  $targetHash = Get-FileSha256 $target
  if ($sourceHash -ne $targetHash) {
    throw "Hash mismatch after copy: $RelativeTarget"
  }

  $file = Get-Item -LiteralPath $target
  $records.Add([pscustomobject]@{
    catalog = $Catalog
    topic = $Topic
    title = $Title
    kind = "source-video"
    source = $Source
    target = $target
    relativeTarget = ($RelativeTarget -replace "\\", "/")
    bytes = $file.Length
    sha256 = $targetHash
    copied = $copyRequired
  })
}

$caseVideos = @(
  @{
    Source = Join-Path $CaseSourceRoot "4-高端制造\2-CAE 软件案例介绍.mp4"
    Target = "cases\04-high-end-manufacturing\02-cae-software-case.mp4"
    Topic = "CASE-04"
    Title = "CAE 软件案例介绍"
  },
  @{
    Source = Join-Path $CaseSourceRoot "6-海洋模拟\1-港科大-淘海数字孪生地球系统-并行优化.mp4"
    Target = "cases\06-ocean-simulation\01-taohai-digital-twin-parallel-optimization.mp4"
    Topic = "CASE-06"
    Title = "港科大－淘海数字孪生地球系统－并行优化"
  },
  @{
    Source = Join-Path $CaseSourceRoot "6-海洋模拟\2-让ROMS区域海洋建模系统高效跑起来.mp4"
    Target = "cases\06-ocean-simulation\02-roms-regional-ocean-modeling.mp4"
    Topic = "CASE-06"
    Title = "让 ROMS 区域海洋建模系统高效跑起来"
  }
)

$productVideos = @(
  @{ Source = "1-国产Token优化工厂\是石科技国产Token优化工厂产品介绍.mp4"; Target = "products\01-token-factory\01-product-introduction.mp4"; Topic = "PRODUCT-01"; Title = "是石科技国产 Token 优化工厂产品介绍" },
  @{ Source = "2-超智算集群\是石科技超智算集群介绍.mp4"; Target = "products\02-supercomputing-cluster\01-product-introduction.mp4"; Topic = "PRODUCT-02"; Title = "是石科技超智算集群介绍" },
  @{ Source = "3-国产异构超智算中心\国产异构超智算中心 第1集.mp4"; Target = "products\03-heterogeneous-center\01-episode-01.mp4"; Topic = "PRODUCT-03"; Title = "国产异构超智算中心 第 1 集" },
  @{ Source = "3-国产异构超智算中心\AI为什么需要记忆 第2集.mp4"; Target = "products\03-heterogeneous-center\02-episode-02.mp4"; Topic = "PRODUCT-03"; Title = "AI 为什么需要记忆 第 2 集" },
  @{ Source = "3-国产异构超智算中心\芯片之间怎么秒传数据 第3集.mp4"; Target = "products\03-heterogeneous-center\03-episode-03.mp4"; Topic = "PRODUCT-03"; Title = "芯片之间怎么秒传数据 第 3 集" },
  @{ Source = "4-国产Token优化工厂计算速度大比拼：CPU vs GPU\Token优化工厂-CPU国产移植GPU1080P.mp4"; Target = "products\04-cpu-vs-gpu\01-cpu-vs-gpu.mp4"; Topic = "PRODUCT-04"; Title = "国产 Token 优化工厂计算速度大比拼：CPU vs GPU" },
  @{ Source = "5-国产Token优化工厂-技术优势\是石科技国产Token优化工厂产品优势盘点.mp4"; Target = "products\05-token-factory-advantages\01-product-advantages.mp4"; Topic = "PRODUCT-05"; Title = "国产 Token 优化工厂产品优势盘点" },
  @{ Source = "6-AI infra\AIinfra.mp4"; Target = "products\06-ai-infra\01-ai-infra.mp4"; Topic = "PRODUCT-06"; Title = "AI Infra" },
  @{ Source = "7-PD分离\AI动画-PD分离.mp4"; Target = "products\07-pd-disaggregation\01-pd-disaggregation.mp4"; Topic = "PRODUCT-07"; Title = "AI 动画－PD 分离" },
  @{ Source = "8-投机解码\投机解码.mp4"; Target = "products\08-speculative-decoding\01-speculative-decoding.mp4"; Topic = "PRODUCT-08"; Title = "投机解码" },
  @{ Source = "9-多层级KV Cache\KVCache.mp4"; Target = "products\09-multi-level-kv-cache\01-kv-cache.mp4"; Topic = "PRODUCT-09"; Title = "多层级 KV Cache" }
)

foreach ($entry in $caseVideos) {
  Copy-MediaFile -Source $entry.Source -RelativeTarget $entry.Target -Catalog "success-cases" -Topic $entry.Topic -Title $entry.Title
}

foreach ($entry in $productVideos) {
  Copy-MediaFile -Source (Join-Path $ProductSourceRoot $entry.Source) -RelativeTarget $entry.Target -Catalog "product-introduction" -Topic $entry.Topic -Title $entry.Title
}

$pptJobs = @(
  @{ Source = "1-互联网\互联网.pptx"; Folder = "01-internet"; Topic = "CASE-01"; Title = "互联网"; Durations = @(8.0, 8.0); GifSlides = @() },
  @{ Source = "2-大模型\大模型.pptx"; Folder = "02-large-models"; Topic = "CASE-02"; Title = "大模型"; Durations = @(8.0, 8.0); GifSlides = @() },
  # Two exact GIF cycles: 5.04 s x 2. PowerPoint's video exporter preserves the embedded GIF frames.
  @{ Source = "3-航空航天\航空航天.pptx"; Folder = "03-aerospace"; Topic = "CASE-03"; Title = "航空航天"; Durations = @(10.08); GifSlides = @(1) },
  # Two exact GIF cycles: 6.33 s x 2.
  @{ Source = "4-高端制造\1-高端制造.pptx"; Folder = "04-high-end-manufacturing"; Topic = "CASE-04"; Title = "高端制造"; Durations = @(12.66); GifSlides = @(1) },
  @{ Source = "5-科研院所\科研院所.pptx"; Folder = "05-research-institutes"; Topic = "CASE-05"; Title = "科研院所"; Durations = @(8.0, 8.0, 8.0, 8.0); GifSlides = @() },
  @{ Source = "7-AI for  Science\AI for  Science.pptx"; Folder = "07-ai-for-science"; Topic = "CASE-07"; Title = "AI FOR SCIENCE"; Durations = @(8.0); GifSlides = @() }
)

$powerPoint = New-Object -ComObject PowerPoint.Application
try {
  foreach ($job in $pptJobs) {
    $sourcePath = Join-Path $CaseSourceRoot $job.Source
    Assert-SourceFile $sourcePath
    $sourceHash = Get-FileSha256 $sourcePath
    $sourcePresentation = $powerPoint.Presentations.Open($sourcePath, $true, $true, $false)
    try {
      if ($sourcePresentation.Slides.Count -ne $job.Durations.Count) {
        throw "Slide count mismatch: $sourcePath has $($sourcePresentation.Slides.Count), expected $($job.Durations.Count)"
      }

      $targetFolder = Join-Path $videoRoot ("cases\" + $job.Folder)
      $deckFolder = Join-Path $slideDeckRoot $job.Folder
      [System.IO.Directory]::CreateDirectory($targetFolder) | Out-Null
      [System.IO.Directory]::CreateDirectory($deckFolder) | Out-Null

      for ($slideIndex = 1; $slideIndex -le $sourcePresentation.Slides.Count; $slideIndex += 1) {
        $duration = [double]$job.Durations[$slideIndex - 1]
        $fileName = "{0:D2}-slide-{0:D2}-loop.mp4" -f $slideIndex
        $targetVideo = Join-Path $targetFolder $fileName
        $oneSlideDeck = Join-Path $deckFolder ("{0:D2}-slide-{0:D2}.pptx" -f $slideIndex)
        $needsExport = $ForcePptExport -or -not (Test-Path -LiteralPath $targetVideo -PathType Leaf)
        if (-not $needsExport) {
          $needsExport = (Get-Item -LiteralPath $targetVideo).LastWriteTimeUtc -lt (Get-Item -LiteralPath $sourcePath).LastWriteTimeUtc
        }

        if ($needsExport) {
          if (Test-Path -LiteralPath $targetVideo) {
            Remove-Item -LiteralPath $targetVideo -Force
          }
          if (Test-Path -LiteralPath $oneSlideDeck) {
            Remove-Item -LiteralPath $oneSlideDeck -Force
          }

          $targetPresentation = $powerPoint.Presentations.Add($false)
          try {
            $targetPresentation.PageSetup.SlideWidth = $sourcePresentation.PageSetup.SlideWidth
            $targetPresentation.PageSetup.SlideHeight = $sourcePresentation.PageSetup.SlideHeight
            $sourcePresentation.Slides.Item($slideIndex).Copy()
            [void]$targetPresentation.Slides.Paste()
            $slide = $targetPresentation.Slides.Item(1)
            $slide.SlideShowTransition.AdvanceOnClick = $false
            $slide.SlideShowTransition.AdvanceOnTime = $true
            $slide.SlideShowTransition.AdvanceTime = $duration
            $targetPresentation.SaveAs($oneSlideDeck, 24)
            $targetPresentation.CreateVideo($targetVideo, $true, [math]::Ceiling($duration), 1080, 30, 85)

            $deadline = (Get-Date).AddMinutes(10)
            do {
              Start-Sleep -Milliseconds 500
              $status = [int]$targetPresentation.CreateVideoStatus
              if ((Get-Date) -gt $deadline) {
                throw "Video export timeout: $targetVideo"
              }
            } while ($status -in 1, 2)
            if ($status -ne 3) {
              throw "Video export failed with status ${status}: $targetVideo"
            }
          }
          finally {
            $targetPresentation.Close()
          }
        }

        Assert-SourceFile $targetVideo
        $file = Get-Item -LiteralPath $targetVideo
        $records.Add([pscustomobject]@{
          catalog = "success-cases"
          topic = $job.Topic
          title = "$($job.Title) · 第 $slideIndex 页"
          kind = "ppt-slide-loop"
          source = $sourcePath
          sourceSha256 = $sourceHash
          sourcePage = $slideIndex
          target = $targetVideo
          relativeTarget = ((Resolve-Path -LiteralPath $targetVideo).Path.Substring($videoRoot.Length + 1) -replace "\\", "/")
          bytes = $file.Length
          sha256 = Get-FileSha256 $targetVideo
          requestedDurationSeconds = $duration
          containsAnimatedGif = $job.GifSlides -contains $slideIndex
          exported = $needsExport
        })
      }
    }
    finally {
      $sourcePresentation.Close()
    }
  }
}
finally {
  $powerPoint.Quit()
  [Runtime.InteropServices.Marshal]::FinalReleaseComObject($powerPoint) | Out-Null
}

$report = [ordered]@{
  schema = "metastone-media-sync/1"
  generatedAt = (Get-Date).ToString("o")
  caseSourceRoot = $CaseSourceRoot
  productSourceRoot = $ProductSourceRoot
  videoRoot = $videoRoot
  pptPolicy = [ordered]@{
    render = "PowerPoint one-slide presentation to H.264 MP4, 1920x1080, 30fps"
    playback = "TV loops each PPT-page MP4 until Pad sends NEXT/PREV/EXIT"
    staticSlideSeconds = 8
    gifPolicy = "Export duration is two complete source-GIF cycles; embedded GIF animation is preserved by PowerPoint video export"
  }
  totals = [ordered]@{
    sourceVideos = ($records | Where-Object kind -eq "source-video").Count
    pptSlideLoops = ($records | Where-Object kind -eq "ppt-slide-loop").Count
    totalPlayableItems = $records.Count
  }
  items = $records
}

$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Output ("MEDIA_SYNC_REPORT=" + $reportPath)
Write-Output ("SOURCE_VIDEOS=" + $report.totals.sourceVideos)
Write-Output ("PPT_SLIDE_LOOPS=" + $report.totals.pptSlideLoops)
Write-Output ("TOTAL_PLAYABLE_ITEMS=" + $report.totals.totalPlayableItems)
