$POD_NAME = kubectl get pods -l app=auth-db -o jsonpath="{.items[0].metadata.name}"
if ($POD_NAME) {
    Write-Host "Found auth-db pod: $POD_NAME"
    Write-Host "Upgrading all users to admin..."
    kubectl exec -it $POD_NAME -- psql -U postgres -d auth_db -c "UPDATE users SET role = 'admin';"
    Write-Host "Done! Please log out and log back in."
} else {
    Write-Host "Could not find auth-db pod."
}
