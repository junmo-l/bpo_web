document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.getElementById("edit-button");
    const saveButton = document.getElementById("save-button");
    const addButton = document.getElementById("add-button");
    const deleteButton = document.getElementById("delete-button");
    const cancelButton = document.getElementById("cancel-button");
    const firstNameInput = document.getElementById("first-name-input");
    const lastNameInput = document.getElementById("last-name-input");
    const departmentInput = document.getElementById("department-input");
    const locationInput = document.getElementById("location-input");
    const authoritySelect = document.getElementById("authority-select");
    const dashboardContainer = document.getElementById("dashboard-list-container");
    const lastAttemptTimeDisplay = document.getElementById("last-attempt-time");
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const passwordRow = document.getElementById("password-row");
    const fullnameDisplay = document.getElementById("fullname");
    const currentUserId = document.getElementById("current-user-id").value; // 현재 유저의 ID를 가져옴

    let originalState = {};

    function updateFontColor() {
        const checkboxes = dashboardContainer.querySelectorAll(".check-box-child");
        checkboxes.forEach(checkbox => {
            const trendElement = checkbox.closest('.check-box-parent').querySelector('.dashboard-value');
            if (checkbox.checked) {
                trendElement.style.color = "#535180"; // 원하는 색상으로 변경
            } else {
                trendElement.style.color = ""; // 기본 색상으로 복원
            }
        });
    }

    editButton.addEventListener("click", function () {
        // 입력 필드를 활성화
        firstNameInput.disabled = false;
        lastNameInput.disabled = false;
        departmentInput.disabled = false;
        locationInput.disabled = false;
        authoritySelect.disabled = false;
        passwordInput.disabled = false;

        // authoritySelect에 edit-mode 클래스 추가
        authoritySelect.classList.add('edit-mode');

        // 기존 상태를 저장
        originalState = {
            fullname: fullnameDisplay.innerText,
            username: usernameInput.value,
            firstName: firstNameInput.value,
            lastNameInput: lastNameInput.value,
            department: departmentInput.value,
            location: locationInput.value,
            authority: authoritySelect.value,
            dashboards: dashboardContainer.innerHTML, // 현재 대시보드 HTML 저장
            lastAccess: lastAttemptTimeDisplay ? lastAttemptTimeDisplay.textContent : '',
            password: passwordInput.value
        };

        // lastAttemptTimeDisplay 숨기기
        if (lastAttemptTimeDisplay) {
            lastAttemptTimeDisplay.parentElement.parentElement.style.display = 'none';
        }

        // passwordRow 표시 및 비밀번호 필드를 공백으로 설정
        passwordRow.style.display = 'flex';
        passwordInput.value = '';  // 비밀번호 필드를 공백으로 설정

        // 기존 대시보드 목록 가져오기
        const currentUserDashboards = new Set(Array.from(dashboardContainer.querySelectorAll(".dashboard-value")).map(elem => elem.textContent));

        // 모든 대시보드를 가져와서 체크박스를 업데이트
        fetch('/get_all_dashboards')
            .then(response => response.json())
            .then(dashboards => {
                dashboardContainer.innerHTML = "";

                dashboards.forEach(dashboard => {
                    const isChecked = currentUserDashboards.has(dashboard);
                    const checkboxHtml = `
                        <div class="check-box-parent">
                            <div class="check-box">
                                <input type="checkbox" class="check-box-child" value="${dashboard}" ${isChecked ? "checked" : ""}>
                            </div>
                            <div class="dashboard-value">${dashboard}</div>
                        </div>
                    `;
                    dashboardContainer.insertAdjacentHTML('beforeend', checkboxHtml);
                });

                // 체크박스를 클릭했을 때 폰트 색상 업데이트
                const checkboxes = dashboardContainer.querySelectorAll(".check-box-child");
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener("change", updateFontColor);
                });

                // 초기 폰트 색상 설정
                updateFontColor();

                // Save 및 Cancel 버튼 표시
                saveButton.style.display = "inline-block";
                cancelButton.style.display = "inline-block";
                editButton.style.display = "none";
                addButton.style.display = "none";
                deleteButton.style.display = "none";
                document.querySelectorAll('.user-info-value:not(.no-edit)').forEach(function (element) {
                    element.classList.add('editable');
                });
                // Save에 edit-mode class 추가
                saveButton.classList.add('edit-mode');
            })
            .catch(error => console.error('Error fetching dashboards:', error));
    });

    // firstName과 lastName input에 이벤트 리스너 추가
    firstNameInput.addEventListener('input', function() {
        fullnameDisplay.innerText = `${firstNameInput.value} ${lastNameInput.value}`;
    });

    lastNameInput.addEventListener('input', function() {
        fullnameDisplay.innerText = `${firstNameInput.value} ${lastNameInput.value}`;
    });

    cancelButton.addEventListener("click", function () {

        if (saveButton.classList.contains('edit-mode')) {

            // 값 원래 상태로 복원

            fullnameDisplay.innerText = originalState.fullname;
            usernameInput.value = originalState.username;
            firstNameInput.value = originalState.firstName;
            lastNameInput.value = originalState.lastName;
            departmentInput.value = originalState.department;
            locationInput.value = originalState.location;
            authoritySelect.value = originalState.authority;
            passwordInput.value = originalState.password;

            // lastAttemptTimeDisplay 복원
            if (lastAttemptTimeDisplay) {
                lastAttemptTimeDisplay.textContent = originalState.lastAccess;
                lastAttemptTimeDisplay.parentElement.parentElement.style.display = 'flex';
            }

            // passwordRow 숨기기
            passwordRow.style.display = 'none';

            // 대시보드 상태 복원
            dashboardContainer.innerHTML = originalState.dashboards;

            // 버튼 상태 복원
            saveButton.style.display = "none";
            cancelButton.style.display = "none";
            editButton.style.display = "inline-block";
            addButton.style.display = "inline-block";
            deleteButton.style.display = "inline-block";

            firstNameInput.disabled = true;
            lastNameInput.disabled = true;
            departmentInput.disabled = true;
            locationInput.disabled = true;
            authoritySelect.disabled = true;
            passwordInput.disabled = true;

            // user-info-value에서 클래스 제거
            document.querySelectorAll('.user-info-value').forEach(function (element) {
                element.classList.remove('editable');
                element.classList.remove('required-fields-error');
                element.removeAttribute('placeholder');
            });

            // authoritySelect에서 edit-mode 클래스 제거
            authoritySelect.classList.remove('edit-mode');

            // Save & Cancel 버튼에서 edit-mode 클래스 제거
            saveButton.classList.remove('edit-mode');
            cancelButton.classList.remove('edit-mode');

            updateFontColor();
        }
    });

    saveButton.addEventListener("click", function () {
        if (saveButton.classList.contains('edit-mode')) {
            // 필수 입력 필드 확인
            const requiredFields = [usernameInput, firstNameInput, lastNameInput];
            let allFieldsFilled = true;

            requiredFields.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('required-fields-error');
                    input.setAttribute('placeholder', 'Required');
                    allFieldsFilled = false;
                } else {
                    input.classList.remove('required-fields-error');
                    input.removeAttribute('placeholder');
                }
            });

            if (!allFieldsFilled) {
                alert('Please fill in all required fields.');
                return;
            }

            if (confirm("Are you sure you want to save these information?")) {
                document.querySelectorAll('.user-info-value').forEach(function (element) {
                    element.classList.remove('editable');
                });

                const userId = currentUserId; // 세션 유저 ID가 아닌, 편집 중인 유저 ID를 사용
                const firstName = firstNameInput.value;
                const lastName = lastNameInput.value;
                const department = departmentInput.value;
                const location = locationInput.value;
                const authority = authoritySelect.value;
                const updatedDashboards = Array.from(dashboardContainer.querySelectorAll("input[type='checkbox']:checked")).map(checkbox => checkbox.value);
                const password = passwordInput.value ? passwordInput.value : null;

                fetch('/update_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        first_name: firstName,
                        last_name: lastName,
                        department_name: department,
                        location: location,
                        authority: authority,
                        dashboards: updatedDashboards,
                        last_access: lastAttemptTimeDisplay ? lastAttemptTimeDisplay.textContent : '',
                        password: password // 비밀번호 필드가 공백일 경우 null로 처리
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    if (data.status === 'success') {
                        window.location.href = window.location.href; // 현재 페이지를 다시 로드
                    }
                })
                .catch(error => {
                    alert('An error occurred while updating.');
                });
            }
        }
    });
});
