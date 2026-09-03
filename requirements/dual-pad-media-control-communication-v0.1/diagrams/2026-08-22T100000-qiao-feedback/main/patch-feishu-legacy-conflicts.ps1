$ErrorActionPreference = 'Stop'

$docToken = 'BACzdwYjJoiOpwxkeBPcRfvrnWg'
$replacements = @(
  @{
    Pattern = '新品发布可编辑版共 19 页，是目前最完整的 Pad 02 候选页面源；第 5、16 页包含内嵌 MP4，已提取为独立候选文件。'
    Content = '新品发布 PPT 整套页面候选及第05页内嵌视频已从当前序列排除；仅保留第16页内嵌视频作为 PRODUCT-01 候选1。'
  },
  @{
    Pattern = '第 5、7、16 页含时间相关元素；仍应把客户选定页面和视频拆成明确 playlist item，现场不运行原生 PPT。'
    Content = '当前不再从新品发布 PPT 选页面；第16页内嵌视频若被确认，则作为独立 playlist item，现场不运行原生 PPT。'
  },
  @{
    Pattern = '新品发布 PPT、拓元、Token 工厂、集群、AI Infra、PD 分离、投机解码、CPU 迁移 GPU、行业 Agent、算电协同均只是候选池，不是正式产品 01—07 的命名。'
    Content = '历史候选池已被 PRODUCT-01—09 工作目录替代；拓元体验台、算电协同落地实践及行业 Agent 当前不映射，整套新品发布 PPT 页面候选不纳入。'
  },
  @{
    Pattern = 'Pad 02 产品 01—07 正式名称'
    Content = 'Pad 02 PRODUCT-01—09 名称、顺序与版本'
  },
  @{
    Pattern = '目前只有候选文件池，没有正式映射'
    Content = '已有乔双丽标注形成的工作映射，尚未完成客户逐项冻结'
  },
  @{
    Pattern = '逐项填写正式产品名及顺序'
    Content = '逐项确认名称、顺序、真实文件、播放方式与版本'
  },
  @{
    Pattern = '新品发布 PPT 选页'
    Content = '新品发布 PPT 历史候选清理'
  },
  @{
    Pattern = '完整 19 页过长，且第 9 页含 KV Cache'
    Content = '整套页面候选与第05页内嵌视频已排除；仅保留第16页内嵌视频作为 P01 候选1'
  },
  @{
    Pattern = '确认只选哪些页；第 9 页本轮排除'
    Content = '无需再选页；确认第16页内嵌视频是否作为 P01 候选1'
  },
  @{
    Pattern = '内嵌视频是否独立播放'
    Content = '第16页内嵌视频是否作为 P01 独立条目'
  },
  @{
    Pattern = '新品发布 PPT 第 5、16 页有内嵌 MP4'
    Content = '第05页内嵌视频已排除；第16页内嵌视频保留为 P01 候选1'
  },
  @{
    Pattern = '确认是否提取成独立条目及其前后页面'
    Content = '确认第16页候选视频的顺序与播放方式'
  },
  @{
    Pattern = '新品发布 PPT 第 5、16 页含内嵌 MP4，可提取为独立候选条目；第 9 页为 KV Cache，本轮排除。'
    Content = '新品发布 PPT 整套页面候选及第05页内嵌视频不纳入当前序列；仅保留第16页内嵌视频作为 PRODUCT-01 候选1。PRODUCT-09 的独立“多层级 KV Cache”视频是另一条需求，按本地候选待确认。'
  }
)

$results = foreach ($item in $replacements) {
  $raw = & lark-cli docs +update --doc $docToken --api-version v2 --as user --command str_replace --pattern $item.Pattern --content $item.Content --format json
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to replace: $($item.Pattern)`n$raw"
  }
  $parsed = $raw | ConvertFrom-Json
  [pscustomobject]@{
    pattern = $item.Pattern
    ok = $parsed.ok
    result = $parsed.data.result
    revision_id = $parsed.data.document.revision_id
    warnings = @($parsed.data.warnings).Count
  }
}

$results | ConvertTo-Json -Depth 5
