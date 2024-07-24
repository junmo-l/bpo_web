function sendRequest2() {

  const username = document.getElementById('username').value;
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('Email').value;
  const confirmemail = document.getElementById('confirmemail').value;
  const department = document.getElementById('Department').value;
  // 이메일 검증
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|info|biz|name|pro|aero|coop|museum|app|blog|shop|tech|online|site|xyz|club|design|news|us|uk|ca|de|fr|jp|kr|cn|in|au|asia|africa|eu|nyc|london|tokyo|edu|gov|mil|int|health|law|finance|media|art|games)$/;
  if (!emailPattern.test(email)) {
      displayFlashMessage('Please enter a valid email address (e.g., name@example.com).');
      return;
  }
  if (email !== confirmemail) {
      displayFlashMessage('Please check and confirm your email.');
      return;
  }

  // 서버로 요청 전송
  const formData = {
      username: username,
      first_name: firstname,
      last_name: lastname,
      email: email,
      confirmemail: confirmemail,
      department: department
      
  };

  fetch('/forgot_password', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          window.location.href = '/request_success';
      } else {
          displayFlashMessage(data.error);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      displayFlashMessage('An error occurred. Please try again.');
  });
}

function displayFlashMessage(message) {
  const errorMessageContainer = document.querySelector('.error-message-container2');
  if (errorMessageContainer) {
      // 기존 에러 메시지 요소 제거
      const existingErrorMessage = errorMessageContainer.querySelector('.error-message2');
      if (existingErrorMessage) {
          errorMessageContainer.removeChild(existingErrorMessage);
      }

      // 새로운 에러 메시지 요소 생성 및 추가
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message2');
      errorMessage.style.color = 'red';
      errorMessage.textContent = message;
      errorMessageContainer.appendChild(errorMessage);
  } else {
      console.error('Error: .error-message-container element not found');
  }
}
