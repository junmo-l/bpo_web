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
                <li>
                    ${user.username.toLowerCase().includes(query.toLowerCase()) ? `<strong>Username:</strong> ${highlightMatch(user.username, query)}<br>` : ''}
                    ${user.first_name.toLowerCase().includes(query.toLowerCase()) ? `<strong>First Name:</strong> ${highlightMatch(user.first_name, query)}<br>` : ''}
                    ${user.last_name.toLowerCase().includes(query.toLowerCase()) ? `<strong>Last Name:</strong> ${highlightMatch(user.last_name, query)}<br>` : ''}
                    ${user.department_name.toLowerCase().includes(query.toLowerCase()) ? `<strong>Department:</strong> ${highlightMatch(user.department_name, query)}<br>` : ''}
                    ${user.dashboard_names.toLowerCase().includes(query.toLowerCase()) ? `<strong>Dashboard Names:</strong> ${highlightMatch(user.dashboard_names, query)}<br>` : ''}
                    ${user.authorities.toLowerCase().includes(query.toLowerCase()) ? `<strong>Authorities:</strong> ${highlightMatch(user.authorities, query)}<br>` : ''}
                    ${user.last_attempt_time && user.last_attempt_time.toLowerCase().includes(query.toLowerCase()) ? `<strong>Last Attempt Time:</strong> ${highlightMatch(user.last_attempt_time, query)}<br>` : ''}
                </li>
            `).join('');
            resultsContainer.innerHTML = `<ul>${resultsList}</ul>`;
        } else {
            resultsContainer.innerHTML = '<p>No results found</p>';
        }
    }
});

// from sqlalchemy import or_
// from sqlalchemy.orm import joinedload

// # Search
// @app.route('/search', methods=['GET'])
// def search():
//     search_query = request.args.get('query', '')
//     if search_query:
//         search_filter = or_(
//             User.username.ilike(f'%{search_query}%'),
//             User.first_name.ilike(f'%{search_query}%'),
//             User.last_name.ilike(f'%{search_query}%'),
//             User.department_name.ilike(f'%{search_query}%'),
//             User.location.ilike(f'%{search_query}%'),
//             User.ringcentral_skill.ilike(f'%{search_query}%')
//         )

//         users = User.query.options(
//             joinedload(User.authorities),
//             joinedload(User.dashboard_access)
//         ).filter(search_filter).all()

//         filtered_users = []
//         for user in users:
//             authorities = ', '.join([auth.authority_name for auth in user.authorities])
//             dashboard_names = get_user_dashboard_names(user)

//             if (search_query.lower() in authorities.lower() or 
//                 search_query.lower() in dashboard_names.lower()):
//                 filtered_users.append(user)
//             else:
//                 user.authorities_str = authorities
//                 user.dashboard_names_str = dashboard_names
//                 filtered_users.append(user)
//     else:
//         users = User.query.options(
//             joinedload(User.authorities),
//             joinedload(User.dashboard_access)
//         ).all()
//         for user in users:
//             user.authorities_str = ', '.join([auth.authority_name for auth in user.authorities])
//             user.dashboard_names_str = get_user_dashboard_names(user)
//         filtered_users = users

//     user_list = []
//     for user in filtered_users:
//         user_data = {
//             'id': user.id,
//             'username': user.username,
//             'first_name': user.first_name,
//             'last_name': user.last_name,
//             'department_name': user.department_name,
//             'dashboard_names': get_user_dashboard_names(user),
//             'authorities': ', '.join([auth.authority_name for auth in user.authorities]),
//             'last_attempt_time': user.last_attempt_time
//         }
//         user_list.append(user_data)

//     return jsonify({'users': user_list})