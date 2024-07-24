document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

 document.addEventListener('DOMContentLoaded', function() {
    var hoverElements = document.querySelectorAll('.gpca-logistics-trend1');

    hoverElements.forEach(function(element) {
        element.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#F1F0FF';
            this.style.borderRadius = '10px';
        });

        element.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const lineDivs = document.querySelectorAll('.line-div');
  const lineDivs2 = document.querySelectorAll('.line-div2');

  // .line-div 처리
  if (lineDivs.length === 1 && lineDivs2.length === 0) {
    lineDivs.forEach(function(lineDiv) {
      lineDiv.style.width = '465px';
    });
  } else {
    lineDivs.forEach(function(lineDiv) {
      lineDiv.style.width = '350px';
    });
  }

  // .line-div2 처리
  lineDivs2.forEach(function(lineDiv) {
    lineDiv.style.width = '350px';
  });
});

