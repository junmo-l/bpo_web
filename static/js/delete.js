document.addEventListener("DOMContentLoaded", function () {
    const deleteButton = document.getElementById("delete-button");

    // users 페이지의 경우
    if (window.location.pathname.includes('/users')) {
        const currentUserIdElement = document.getElementById("current-user-id");

        // currentUserIdElement가 존재하는지 확인
        if (currentUserIdElement) {
            const currentUserId = currentUserIdElement.value;

            deleteButton.addEventListener("click", function () {
                confirmDeletion([currentUserId]);
            });
        }
    }

    // userlist 페이지의 경우
    else if (window.location.pathname.includes('/userlist')) {
        const checkboxes = document.querySelectorAll(".frame-child");

        function toggleDeleteButton() {
            const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            deleteButton.style.display = anyChecked ? "block" : "none";
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", toggleDeleteButton);
        });

        // 페이지 로드 시 삭제 버튼 가시성 초기화
        toggleDeleteButton();

        // deleteButton 클릭 이벤트가 한 번만 등록되도록 수정
        if (!deleteButton.hasAttribute("data-event-added")) {
            deleteButton.setAttribute("data-event-added", "true");
            deleteButton.addEventListener("click", function () {
                const userIds = Array.from(checkboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.getAttribute('data-user-id')); // data-user-id 속성 사용
                if (userIds.length > 0) {
                    confirmDeletion(userIds);
                }
            });
        }
    }

    function confirmDeletion(userIds) {
        if (confirm("Are you sure you want to delete these users?")) {
            fetch('/delete_users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_ids: userIds }),
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    window.location.href = '/userlist'; // 삭제 후 userlist 페이지로 리디렉션
                })
                .catch(error => {
                    alert('An error occurred while deleting.');
                });
        }
    }
});
