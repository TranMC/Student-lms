function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    return currentUser;
}

function checkTeacherAuth() {
    const user = checkAuth();
    if (user && user.role !== 'teacher') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function checkStudentAuth() {
    const user = checkAuth();
    if (user && user.role !== 'student') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
} 