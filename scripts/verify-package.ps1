param(
    [string]$Version = "5.9.4961-Revisited.1"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$archivePath = Join-Path $root "dist\AuctioneerRevisited-$Version.zip"
$allowedDirectories = @(
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
$requiredEntries = @(
    "Auc-Advanced/Auc-Advanced.toc",
    "Auc-Advanced/CoreServerRules.lua",
    "BeanCounter/BeanCounter.toc",
    "BeanCounter/BeanCounterMail.lua",
    "BeanCounter/PostMonitor.lua"
)

if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    throw "Package does not exist: $archivePath"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)

try {
    $entryNames = @($archive.Entries | ForEach-Object FullName)
    foreach ($requiredEntry in $requiredEntries) {
        if ($entryNames -notcontains $requiredEntry) {
            throw "Package is missing $requiredEntry"
        }
    }

    foreach ($entryName in $entryNames) {
        $topLevel = $entryName.Split("/")[0]
        if ($allowedDirectories -notcontains $topLevel) {
            throw "Unexpected package path: $entryName"
        }
    }

    foreach ($directory in $allowedDirectories) {
        if (-not ($entryNames | Where-Object { $_.StartsWith("$directory/") })) {
            throw "Package is missing addon directory: $directory"
        }
    }

    $tocEntry = $archive.GetEntry("Auc-Advanced/Auc-Advanced.toc")
    $reader = [System.IO.StreamReader]::new($tocEntry.Open())
    try {
        $toc = $reader.ReadToEnd()
    }
    finally {
        $reader.Dispose()
    }

    if ($toc -notmatch "(?m)^## Interface: 30300\r?$") {
        throw "Packaged Auctioneer TOC does not target interface 30300"
    }
    if ($toc -notmatch "(?m)^## Version: 5\.9\.4961-Revisited\.1\r?$") {
        throw "Packaged Auctioneer TOC has the wrong version"
    }

    Write-Output "Verified $($archive.Entries.Count) packaged files across $($allowedDirectories.Count) addon directories."
}
finally {
    $archive.Dispose()
}

$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath
Write-Output "SHA256 $($hash.Hash)"
