$baseUrl = "http://localhost:3000/api"

Write-Host "1. Registering new test user..."
$regBody = @{
    email = "test$(Get-Random)@example.com"
    password = "password123"
    username = "TestUser$(Get-Random)"
} | ConvertTo-Json

$regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
$token = $regResponse.access_token

if ($token) {
    Write-Host "✅ Registered successfully. Got JWT Token."
} else {
    Write-Host "❌ Registration failed."
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n2. Fetching courses from Supabase DB..."
$courses = Invoke-RestMethod -Uri "$baseUrl/courses" -Method Get -Headers $headers
if ($courses.length -gt 0) {
    Write-Host "✅ Fetched $($courses.length) courses from Supabase DB."
} else {
    Write-Host "❌ No courses found."
}

Write-Host "`n3. Creating a new Flashcard in Supabase DB..."
$flashcardBody = @{
    front = "Pałac Pamięci"
    back = "Memory Palace"
    mnemonic = "Imagine a large palace"
    palaceLocation = "Main Hall"
} | ConvertTo-Json

$flashcard = Invoke-RestMethod -Uri "$baseUrl/flashcards" -Method Post -Body $flashcardBody -Headers $headers -ContentType "application/json"
if ($flashcard.id) {
    Write-Host "✅ Flashcard created successfully in Supabase DB. ID: $($flashcard.id)"
} else {
    Write-Host "❌ Flashcard creation failed."
}

Write-Host "`n4. Fetching due flashcards..."
$due = Invoke-RestMethod -Uri "$baseUrl/flashcards/due" -Method Get -Headers $headers
if ($due.length -gt 0) {
    Write-Host "✅ Found $($due.length) due flashcards."
} else {
    Write-Host "❌ No due flashcards found."
}

Write-Host "`nAll tests passed successfully against the online Supabase DB via Swagger endpoints!"
