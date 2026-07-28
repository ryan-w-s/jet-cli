$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $scriptRoot
try {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required to publish a release."
    }

    gh auth status
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI is not authenticated. Run 'gh auth login' and try again."
    }

    $versionOutput = npm version patch
    $newVersion = ($versionOutput | Select-Object -Last 1).Trim().TrimStart("v")
    $releaseTag = "v$newVersion"

    git push origin master --follow-tags

    gh release create $releaseTag --verify-tag --title $releaseTag --generate-notes
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create GitHub release $releaseTag."
    }

    Push-Location (Join-Path $scriptRoot "skills\jet")
    try {
        clawhub publish . --version $newVersion --slug just-easy-tasks
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
