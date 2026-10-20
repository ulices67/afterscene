$ErrorActionPreference = 'Stop'
$desktopRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cacheRoot = Join-Path $desktopRoot '.cache'
$tempRoot = Join-Path $cacheRoot 'tmp'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$env:ELECTRON_CACHE = Join-Path $cacheRoot 'electron'
$env:ELECTRON_BUILDER_CACHE = Join-Path $cacheRoot 'electron-builder'
$env:TEMP = $tempRoot
$env:TMP = $tempRoot
& node (Join-Path $PSScriptRoot 'patch-builder.mjs')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar Electron Builder.' }
$electronDist = Join-Path $cacheRoot 'electron-dist'
if (-not (Test-Path -LiteralPath (Join-Path $electronDist 'electron.exe'))) {
  $archive = & node (Join-Path $PSScriptRoot 'resolve-electron.mjs')
  if ($LASTEXITCODE -ne 0 -or -not $archive) { throw 'No se pudo descargar Electron.' }
  New-Item -ItemType Directory -Force -Path $electronDist | Out-Null
  Expand-Archive -LiteralPath $archive.Trim() -DestinationPath $electronDist -Force
}
Push-Location $desktopRoot
try {
  npm run dist
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}
