let confirmCallback = null;

function showConfirmDialog(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmDialog').style.display = 'block';
    confirmCallback = callback;
}

function hideConfirmDialog() {
    document.getElementById('confirmDialog').style.display = 'none';
    confirmCallback = null;
}

function handleConfirm() {
    if (confirmCallback) {
        confirmCallback();
    }
    hideConfirmDialog();
}
