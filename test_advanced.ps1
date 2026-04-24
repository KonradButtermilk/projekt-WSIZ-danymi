$baseUrl = "http://localhost:3000/api"

Write-Host "===================================="
Write-Host "   ADVANCED API AUTOMATED TESTING   "
Write-Host "====================================`n"

$username = "AdvTester$(Get-Random)"
$email = "advtest$(Get-Random)@example.com"
$password = "password123"

# 1. Register & Login
Write-Host "1. Registering user $username..."
$regBody = @{ username = $username; email = $email; password = $password } | ConvertTo-Json
$regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
$token = $regResponse.access_token

$headers = @{ Authorization = "Bearer $token" }

# 2. Fetch courses & lessons
$courses = Invoke-RestMethod -Uri "$baseUrl/courses" -Method Get -Headers $headers
$courseId = $courses[0].id
$lessons = Invoke-RestMethod -Uri "$baseUrl/courses/$courseId/lessons" -Method Get -Headers $headers
$lesson1 = $lessons[0]
$lesson2 = $lessons[1]

Write-Host "`n2. [SECURITY TEST] Attempting to fetch locked Quiz for Lesson 2..."
try {
    $lockedQuiz = Invoke-RestMethod -Uri "$baseUrl/quizzes/lesson/$($lesson2.id)" -Method Get -Headers $headers
    Write-Host "❌ FAIL: API allowed fetching a locked quiz!"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host "✅ SUCCESS: API properly blocked access to locked quiz (403 Forbidden)."
    } else {
        Write-Host "❌ FAIL: Expected 403, got something else."
        Write-Host $_.Exception.Message
    }
}

Write-Host "`n3. Fetching unlocked Quiz for Lesson 1..."
$quiz1 = Invoke-RestMethod -Uri "$baseUrl/quizzes/lesson/$($lesson1.id)" -Method Get -Headers $headers
if ($quiz1.quiz.id) {
    Write-Host "✅ Fetched quiz successfully."
} else {
    Write-Host "❌ Failed to fetch quiz."
}

Write-Host "`n4. Submitting Quiz for Lesson 1..."
# Automatically grab correct answers for MCQs
$answersList = @()
foreach ($q in $quiz1.questions) {
    if ($q.type -eq 'multiple_choice') {
        # Random guess (will likely fail unless we know the right one, but let's just pick the first)
        $answersList += @{ questionId = $q.id; answer = $q.answers[0].id }
    }
}
$submitBody = @{ answers = $answersList } | ConvertTo-Json -Depth 5
try {
    $submitResult = Invoke-RestMethod -Uri "$baseUrl/quizzes/$($quiz1.quiz.id)/submit" -Method Post -Body $submitBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Quiz submitted. Score: $($submitResult.score)/$($submitResult.totalQuestions). Passed: $($submitResult.passed)"
} catch {
    Write-Host "❌ Quiz submission failed."
    Write-Host $_.Exception.Message
}

Write-Host "`n5. Testing Flashcards SM-2 Logic..."
$flashcardBody = @{ front = "TestFront"; back = "TestBack" } | ConvertTo-Json
$fc = Invoke-RestMethod -Uri "$baseUrl/flashcards" -Method Post -Body $flashcardBody -Headers $headers -ContentType "application/json"

$reviewBody = @{ quality = 5 } | ConvertTo-Json
$reviewedFc = Invoke-RestMethod -Uri "$baseUrl/flashcards/$($fc.id)/review" -Method Post -Body $reviewBody -Headers $headers -ContentType "application/json"
if ($reviewedFc.interval -gt 0) {
    Write-Host "✅ Flashcard reviewed with perfect quality. New interval: $($reviewedFc.interval) days."
} else {
    Write-Host "❌ Flashcard interval didn't increase as expected."
}

Write-Host "`n===================================="
Write-Host "          ALL TESTS FINISHED        "
Write-Host "===================================="
