param(
    [string]$Version = "5.9.4961-Revisited.1"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$output = Join-Path $dist "AuctioneerRevisited-$Version.zip"
$addonDirectories = @(
    "!Swatter",
    "Auc-Advanced",
    "Auc-Filter-Basic",
    "Auc-ScanData",
    "Auc-Stat-Histogram",
    "Auc-Stat-iLevel",
    "Auc-Stat-Purchased",
    "Auc-Stat-Simple",
    "Auc-Stat-StdDev",
    "Auc-Util-FixAH",
    "BeanCounter",
    "Enchantrix",
    "Enchantrix-Barker",
    "Informant",
    "SlideBar",
    "Stubby"
)

New-Item -ItemType Directory -Path $dist -Force | Out-Null
if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open(
    $output,
    [System.IO.Compression.ZipArchiveMode]::Create
)
$fixedTimestamp = [DateTimeOffset]::Parse("2010-10-20T00:00:00Z")

try {
    foreach ($directoryName in $addonDirectories) {
        $directory = Join-Path $root $directoryName
        if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
            throw "Missing addon directory: $directoryName"
        }

        $files = Get-ChildItem -LiteralPath $directory -File -Recurse |
            Sort-Object FullName

        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($root.Length + 1)
            $entryName = $relativePath.Replace("\", "/")
            $entry = $archive.CreateEntry(
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            )
            $entry.LastWriteTime = $fixedTimestamp

            $inputStream = $file.OpenRead()
            $outputStream = $entry.Open()
            try {
                $inputStream.CopyTo($outputStream)
            }
            finally {
                $outputStream.Dispose()
                $inputStream.Dispose()
            }
        }
    }
}
finally {
    $archive.Dispose()
}

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $output
Write-Output "Created $output"
Write-Output "SHA256 $($hash.Hash)"
