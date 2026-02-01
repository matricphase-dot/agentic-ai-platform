Write-Host "?? Agentic AI One-Click Deployment" -ForegroundColor Green 
Write-Host "Select deployment target:" -ForegroundColor Yellow 
Write-Host "1) Heroku (Free tier)" 
Write-Host "2) AWS EC2 (Production)" 
Write-Host "3) Google Cloud Run" 
Write-Host "4) DigitalOcean Droplet" 
$choice = Read-Host "Enter choice (1-4)" 
 
switch ($choice) { 
    "1" { 
        heroku login 
        heroku create agentic-ai-$((Get-Date).ToString('MMddHHmm')) 
        git push heroku main 
        heroku open 
    } 
    "2" { 
        aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t2.micro --key-name agentic-key --security-group-ids sg-xxxxxxxx --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Agentic-AI}]' 
    } 
    "3" { 
        gcloud run deploy agentic-ai --source . --region us-central1 --allow-unauthenticated 
    } 
    "4" { 
        doctl compute droplet create agentic-ai --size s-1vcpu-1gb --image ubuntu-20-04-x64 --region nyc1 --ssh-keys <your-ssh-key> 
    } 
} 
