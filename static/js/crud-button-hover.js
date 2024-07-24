document.addEventListener('DOMContentLoaded', function() {
    // 1. Edit button
    const editButton = document.getElementById('edit-button');
    if (editButton) {
        editButton.addEventListener('mouseover', function() {
            this.src = "static/images/Edit State = Selected.png";
        });
        editButton.addEventListener('mouseout', function() {
            this.src = "static/images/Edit State = Default.png";
        });
    }

    // 2. Add button
    const addButton = document.getElementById('add-button');
    if (addButton) {
        addButton.addEventListener('mouseover', function() {
            this.src = "static/images/Add State = Selected.png";
        });
        addButton.addEventListener('mouseout', function() {
            this.src = "static/images/Add State = Default.png";
        });
    }

    // 3. Delete button
    const deleteButton = document.getElementById('delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('mouseover', function() {
            this.src = "static/images/Deleted State = Selected.png";
        });
        deleteButton.addEventListener('mouseout', function() {
            this.src = "static/images/Deleted State = Default.png";
        });
    }

    // 4. Save button
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('mouseover', function() {
            this.src = "static/images/Save State = Selected.png";
        });
        saveButton.addEventListener('mouseout', function() {
            this.src = "static/images/Save State = Default.png";
        });
    }

    // 5. Cancel button
    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('mouseover', function() {
            this.src = "static/images/Back State = Selected.png";
        });
        cancelButton.addEventListener('mouseout', function() {
            this.src = "static/images/Back State = Default.png";
        });
    }
});
