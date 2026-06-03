$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $scriptRoot
try {
    $versionOutput = npm version patch
    $newVersion = ($versionOutput | Select-Object -Last 1).Trim().TrimStart("v")

    git push origin master --follow-tags

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
