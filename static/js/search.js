document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results');

    searchInput.addEventListener('input', function() {
        const query = searchInput.value;
        if (query.length > 0) {
            fetch(`/search?query=${query}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Search query:", query);
                    console.log("Search results:", data);
                    displayResults(data.users, query);
                })
                .catch(error => {
                    console.error('Error:', error);
                    resultsContainer.innerHTML = '<p>No results found</p>';
                });
        } else {
            resultsContainer.innerHTML = '';
        }
    });

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function displayResults(users, query) {
        if (users.length > 0) {
            const resultsList = users.map(user => `
                <div class="result-item">
                    <div class="result-username-parrents">
                        <div class="result-username">${highlightMatch(user.username, query)}</div>
                        <div class="result-email">${highlightMatch(user.username, query)}@kwinternational.com</div>
                    </div>
                </div>
            `).join('');
            resultsContainer.innerHTML = resultsList;
        } else {
            resultsContainer.innerHTML = '<p>No results found</p>';
        }
    }
});
