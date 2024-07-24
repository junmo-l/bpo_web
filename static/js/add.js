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
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const lastAttemptTimeDisplay = document.getElementById("last-attempt-time");
    const passwordRow = document.getElementById("password-row");
    const fullnameDisplay = document.getElementById("fullname");

    let originalState = {};

    // select 클릭 시 이미지 변환
    authoritySelect.addEventListener('mousedown', function () {
        this.classList.toggle('open');
    });

    authoritySelect.addEventListener('change', function () {
        this.classList.remove('open');

        // master가 선택되었을 때 모든 대시보드 체크박스 선택
        if (this.value === 'master') {
            const checkboxes = dashboardContainer.querySelectorAll(".check-box-child");
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateFontColor();
        } else if (this.value === 'viewer') {
            const checkboxes = dashboardContainer.querySelectorAll(".check-box-child");
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateFontColor();
        }
    });

    authoritySelect.addEventListener('blur', function () {
        this.classList.remove('open');
    });

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

    function generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    }

    function activateAddMode() {
        // 기존 상태를 저장
        originalState = {
            fullname: fullnameDisplay.innerText,
            username: usernameInput.value,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            department: departmentInput.value,
            location: locationInput.value,
            authority: authoritySelect.value,
            dashboards: dashboardContainer.innerHTML, // 현재 대시보드 HTML 저장
            lastAccess: lastAttemptTimeDisplay ? lastAttemptTimeDisplay.textContent : '',
            password: passwordInput.value // 현재 비밀번호 저장
        };

        // 입력 필드를 활성화하고 값 비우기
        usernameInput.disabled = false;
        firstNameInput.disabled = false;
        lastNameInput.disabled = false;
        departmentInput.disabled = false;
        locationInput.disabled = false;
        authoritySelect.disabled = false;
        passwordInput.disabled = false;

        fullnameDisplay.innerText = "";
        usernameInput.value = "";
        firstNameInput.value = "";
        lastNameInput.value = "";
        departmentInput.value = "";
        locationInput.value = "";
        authoritySelect.value = "viewer";

        // 비밀번호 필드 활성화 및 임의 비밀번호 설정
        passwordRow.style.display = 'flex';
        passwordInput.value = generateRandomPassword();

        // last_attempt_time row none 처리
        if (lastAttemptTimeDisplay) {
            lastAttemptTimeDisplay.parentElement.parentElement.style.display = 'none'; // row 숨김 처리
        }

        // authoritySelect에 edit-mode 클래스 추가
        authoritySelect.classList.add('edit-mode');

        // .user-info-value와 .username에 'editable' 클래스 추가
        document.querySelectorAll('.user-info-value, .user-info-value').forEach(function (element) {
            element.classList.add('editable');
        });

        // 모든 대시보드를 가져와서 체크되지 않은 상태로 업데이트
        fetch('/get_all_dashboards')
            .then(response => response.json())
            .then(dashboards => {
                dashboardContainer.innerHTML = "";

                dashboards.forEach(dashboard => {
                    const checkboxHtml = `
                        <div class="check-box-parent">
                            <div class="check-box">
                                <input type="checkbox" class="check-box-child" value="${dashboard}">
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

                // Save 버튼에 add-mode 클래스 추가
                saveButton.classList.add('add-mode');
                cancelButton.classList.add('add-mode');
            })
            .catch(error => console.error('Error fetching dashboards:', error));
    }

    addButton.addEventListener("click", activateAddMode);

    // firstName과 lastName input에 이벤트 리스너 추가
    firstNameInput.addEventListener('input', function() {
        fullnameDisplay.innerText = `${firstNameInput.value} ${lastNameInput.value}`;
    });

    lastNameInput.addEventListener('input', function() {
        fullnameDisplay.innerText = `${firstNameInput.value} ${lastNameInput.value}`;
    });

    cancelButton.addEventListener("click", function () {

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const fromUserlist = urlParams.get('from_userlist') === 'true';

        if (cancelButton.classList.contains('add-mode') && fromUserlist) {
            // userlist에서 넘어온 경우 userlist로 이동
            window.location.href = '/userlist';
        } else {
            // 값 원래 상태로 복원
            fullnameDisplay.innerText = originalState.fullname;
            usernameInput.value = originalState.username;
            firstNameInput.value = originalState.firstName;
            lastNameInput.value = originalState.lastName;
            departmentInput.value = originalState.department;
            locationInput.value = originalState.location;
            authoritySelect.value = originalState.authority;
            passwordInput.value = originalState.password; // 비밀번호 원래 상태로 복원
            if (lastAttemptTimeDisplay) {
                lastAttemptTimeDisplay.textContent = originalState.lastAccess;
                lastAttemptTimeDisplay.parentElement.parentElement.style.display = 'flex'; // row 복원
            }
            passwordRow.style.display = 'none';

            // authoritySelect에서 edit-mode 클래스 제거
            authoritySelect.classList.remove('edit-mode');

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

            document.querySelectorAll('.user-info-value, .username').forEach(function (element) {
                element.classList.remove('editable');
                element.classList.remove('required-fields-error');
                element.removeAttribute('placeholder');
            });

            // Save 버튼에서 add-mode 클래스 제거
            saveButton.classList.remove('add-mode');
            cancelButton.classList.remove('add-mode');

            updateFontColor();
        }
    });

    saveButton.addEventListener("click", function () {
        if (saveButton.classList.contains('add-mode')) {
            // 필수 입력 필드 확인
            const requiredFields = [usernameInput, firstNameInput, lastNameInput, passwordInput];
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

            // 중복 사용자명 확인
            fetch(`/check_username?username=${usernameInput.value}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        alert('Username already exists. Please choose a different username.');
                    } else {
                        if (confirm("Are you sure you want to create this user?")) {
                            handleSave('/create');
                        }
                    }
                })
                .catch(error => {
                    alert('An error occurred while checking the username.');
                });
        }
    });

    function handleSave(url) {
        const username = usernameInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const department = departmentInput.value;
        const location = locationInput.value;
        let authority = authoritySelect.value.trim();
        const password = passwordInput.value.trim();
        const updatedDashboards = Array.from(dashboardContainer.querySelectorAll("input[type='checkbox']:checked")).map(checkbox => checkbox.value);
    
        // 필수 입력 필드 확인
        if (!firstName || !lastName || !username || !password) {
            alert('Please fill in all required fields.');
            return;
        }
    
        const userData = {
            username: username,
            first_name: firstName,
            last_name: lastName,
            department_name: department,
            location: location,
            authority: authority,
            password: password,
            dashboards: updatedDashboards
        };
    
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                // 새로 생성된 유저의 username을 받아온다.
                const newUsername = data.user_info.username;
    
                // 새로운 유저의 페이지로 리다이렉트
                window.location.href = `/users?username=${newUsername}`;
            }
        })
        .catch(error => {
            alert('An error occurred while processing the request.');
        });
    }

    // URL 파라미터를 확인하여 add 모드인지 체크
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add_mode') === 'true') {
        activateAddMode();
    }
});
