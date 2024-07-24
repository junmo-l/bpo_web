document.addEventListener('DOMContentLoaded', function() {
  const allCheckBox = document.getElementById('all-check-box');
  const checkboxes = document.querySelectorAll('.frame-child');
  const deleteButton = document.getElementById('delete-button');
  const buttonContainer = document.querySelector('.button-container');

  function toggleDeleteButton() {
    const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    if (anyChecked) {
        deleteButton.style.display = 'inline';
        buttonContainer.classList.add('checked');
    } else {
        deleteButton.style.display = 'none';
        buttonContainer.classList.remove('checked');
    }
}

  if (allCheckBox) {
      allCheckBox.addEventListener('change', function() {
          checkboxes.forEach(checkbox => {
              checkbox.checked = this.checked;
          });
          toggleDeleteButton();
          
          // 체크된 체크박스 ID를 콘솔에 출력
          const checkedIds = Array.from(checkboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.getAttribute('data-user-id'));
          console.log("All Check box click - Selected IDs:", checkedIds);
      });
  }

  checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          toggleDeleteButton();
          
          // 개별 체크박스 변경 시 ID를 콘솔에 출력
          const checkedIds = Array.from(checkboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.getAttribute('data-user-id'));
          console.log("Individual checkbox change - Selected IDs:", checkedIds);
      });
  });

  // 페이지 로드 시 삭제 버튼 가시성 초기화
  toggleDeleteButton();
});