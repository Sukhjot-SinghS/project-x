$componentsPath = "src\components"

# 1. Add 'use client' to files containing specific React hooks or browser APIs
$filesWithHooks = Get-ChildItem -Path $componentsPath -Recurse -Include "*.tsx" | Select-String -Pattern "useState|useEffect|useRef|useNavigate|useLocation|useParams|useAuth|useToast|useMockFetch|useCountdown|onClick|onChange|onKeyDown" -List | Select-Object -ExpandProperty Path

foreach ($file in $filesWithHooks) {
    $content = Get-Content $file -Raw
    if ($content -notmatch "^'use client'") {
        Set-Content -Path $file -Value ("'use client'`n" + $content)
    }
}

# 2. Fix react-router-dom imports -> next/navigation and next/link
$allComponents = Get-ChildItem -Path $componentsPath -Recurse -Include "*.tsx"

foreach ($file in $allComponents) {
    $content = Get-Content $file -Raw
    $modified = $false

    # Replace imports
    if ($content -match "import \{([^}]*)\} from 'react-router-dom';") {
        $imports = $matches[1]
        $newImports = ""
        $modified = $true
        
        $hasLink = $imports -match "Link"
        $hasRouter = $imports -match "useNavigate|useLocation|useParams"
        
        if ($hasLink) {
            $newImports += "import Link from 'next/link';`n"
        }
        if ($hasRouter) {
            $routerImports = @()
            if ($imports -match "useNavigate") { $routerImports += "useRouter" }
            if ($imports -match "useLocation") { $routerImports += "usePathname" }
            if ($imports -match "useParams") { $routerImports += "useParams" }
            $newImports += "import { " + ($routerImports -join ", ") + " } from 'next/navigation';`n"
        }
        
        $content = $content -replace "import \{[^}]*\} from 'react-router-dom';", $newImports.TrimEnd("`n")
    }

    # Replace usages
    if ($content -match "useNavigate") {
        $content = $content -replace "useNavigate", "useRouter"
        $content = $content -replace "navigate\(-1\)", "router.back()"
        $content = $content -replace "navigate\(", "router.push("
        $modified = $true
    }
    
    if ($content -match "useLocation") {
        $content = $content -replace "useLocation", "usePathname"
        $content = $content -replace "location\.pathname", "pathname"
        $modified = $true
    }
    
    if ($content -match "<Link[^>]*to=") {
        $content = $content -replace "to=", "href="
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
    }
}
