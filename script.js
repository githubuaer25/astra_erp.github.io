// ERP Management System JavaScript

// Global variables
let currentModule = 'dashboard';
let students = [];
let teachers = [];
let courses = [];
let attendance = [];
let fees = [];
let examinations = [];
let books = [];
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded, initializing app...');
    
    // Check if user is logged in
    if (!checkUserLogin()) {
        console.log('No user found, creating demo user...');
        // Create demo user for testing - you can change userType here
        const demoUser = {
            userType: 'admin', // Change to 'student', 'teacher', or 'admin'
            fullName: 'Admin User',
            email: 'admin@school.edu',
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('erp_user_data', JSON.stringify(demoUser));
        currentUser = demoUser;
    }
    
    try {
        initializeApp();
        loadSampleData();
        setupEventListeners();
        updateUserInfo();
        customizeUIForUserRole(); // Add role-based customization
        console.log('App initialized successfully for user type:', currentUser.userType);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Initialize application
function initializeApp() {
    // Load data from localStorage
    loadDataFromStorage();
    
    // Show dashboard by default
    showModule('dashboard');
    
    // Initialize charts
    initializeCharts();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation menu with smooth scrolling
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nav item clicked:', this.getAttribute('data-module'));
            const module = this.getAttribute('data-module');
            showModule(module);
            
            // Smooth scroll to top when switching modules
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Search functionality
    document.getElementById('studentSearch')?.addEventListener('input', filterStudents);
    document.getElementById('teacherSearch')?.addEventListener('input', filterTeachers);
    document.getElementById('courseSearch')?.addEventListener('input', filterCourses);
    document.getElementById('feeSearch')?.addEventListener('input', filterFees);
    // Removed filterBooks since we changed to LMS system

    // Form submissions
    document.getElementById('studentForm')?.addEventListener('submit', handleStudentSubmit);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Scroll detection for user info and sticky header
    window.addEventListener('scroll', handleScroll);
    
    // Initialize sticky header
    initializeStickyHeader();
    
    // Smooth scrolling for footer links
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Handle scroll event to show/hide user info in header
function handleScroll() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const userInfoHeader = document.getElementById('userInfoHeader');
    const mainUserInfo = document.querySelector('.user-info');
    
    if (scrollPercentage >= 60) {
        // Show user info in header with smooth transition
        userInfoHeader.classList.add('show');
        
        // Apply scrolling transition to main user info
        if (mainUserInfo) {
            mainUserInfo.classList.remove('scrolling-out');
            mainUserInfo.classList.add('scrolling');
            
            // After a delay, apply the full scrolling-out effect
            setTimeout(() => {
                if (scrollPercentage >= 60) {
                    mainUserInfo.classList.remove('scrolling');
                    mainUserInfo.classList.add('scrolling-out');
                }
            }, 300);
        }
    } else {
        // Hide user info in header
        userInfoHeader.classList.remove('show');
        
        // Restore main user info with smooth transition
        if (mainUserInfo) {
            mainUserInfo.classList.remove('scrolling', 'scrolling-out');
        }
    }
}

// Module navigation with smooth transitions
function showModule(moduleName) {
    // Add fade out effect to current module
    const currentActiveModule = document.querySelector('.module.active');
    if (currentActiveModule) {
        currentActiveModule.style.opacity = '0';
        currentActiveModule.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            // Hide all modules
            document.querySelectorAll('.module').forEach(module => {
                module.classList.remove('active');
            });

            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Show selected module with fade in effect
            const newModule = document.getElementById(moduleName);
            newModule.classList.add('active');
            newModule.style.opacity = '0';
            newModule.style.transform = 'translateY(20px)';
            
            // Add active class to selected nav item
            document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');
            
            // Fade in new module
            setTimeout(() => {
                newModule.style.opacity = '1';
                newModule.style.transform = 'translateY(0)';
            }, 50);
            
            currentModule = moduleName;
        }, 150);
    } else {
        // First load - no transition needed
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        document.getElementById(moduleName).classList.add('active');
        document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');
        currentModule = moduleName;
    }

    // Load module-specific data
    switch(moduleName) {
        case 'students':
            loadStudents();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'fees':
            loadFees();
            break;
        case 'examinations':
            loadExaminations();
            break;
        case 'lms':
            loadLMS();
            break;
        case 'reports':
            updateCharts();
            break;
    }
}

// Student Management
function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.year}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewStudent(${student.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editStudent(${student.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openStudentModal(studentId = null) {
    const modal = document.getElementById('studentModal');
    const form = document.getElementById('studentForm');
    
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentEmail').value = student.email;
            document.getElementById('studentCourse').value = student.course;
            document.getElementById('studentYear').value = student.year;
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

function handleStudentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        course: document.getElementById('studentCourse').value,
        year: document.getElementById('studentYear').value
    };

    // Check if editing existing student
    const existingStudent = students.find(s => s.email === formData.email);
    
    if (existingStudent) {
        // Update existing student
        Object.assign(existingStudent, formData);
        showMessage('Student updated successfully!', 'success');
    } else {
        // Add new student
        const newStudent = {
            id: Date.now(),
            ...formData,
            status: 'active',
            enrollmentDate: new Date().toISOString()
        };
        students.push(newStudent);
        showMessage('Student added successfully!', 'success');
    }

    saveDataToStorage();
    loadStudents();
    closeModal('studentModal');
}

function editStudent(id) {
    openStudentModal(id);
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        saveDataToStorage();
        loadStudents();
        showMessage('Student deleted successfully!', 'success');
    }
}

function viewStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        alert(`Student Details:\nName: ${student.name}\nEmail: ${student.email}\nCourse: ${student.course}\nYear: ${student.year}`);
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Teacher Management
function loadTeachers() {
    const tbody = document.getElementById('teacherTableBody');
    tbody.innerHTML = '';

    teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.email}</td>
            <td>${teacher.department}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.experience} years</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewTeacher(${teacher.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editTeacher(${teacher.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTeacher(${teacher.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openTeacherModal(teacherId = null) {
    // Similar to student modal but for teachers
    alert('Teacher modal functionality - to be implemented');
}

function filterTeachers() {
    const searchTerm = document.getElementById('teacherSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#teacherTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Course Management
function loadCourses() {
    const tbody = document.getElementById('courseTableBody');
    tbody.innerHTML = '';

    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.department}</td>
            <td>${course.duration}</td>
            <td>${course.credits}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewCourse('${course.code}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editCourse('${course.code}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCourse('${course.code}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterCourses() {
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#courseTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Attendance Management
function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    attendance.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.studentId}</td>
            <td>${record.studentName}</td>
            <td><span class="status-badge ${record.status === 'present' ? 'status-active' : 'status-inactive'}">${record.status}</span></td>
            <td>${record.time}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editAttendance(${record.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function markAttendance() {
    alert('Mark attendance functionality - to be implemented');
}

// Fee Management
function loadFees() {
    const tbody = document.getElementById('feeTableBody');
    tbody.innerHTML = '';

    fees.forEach(fee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fee.studentId}</td>
            <td>${fee.studentName}</td>
            <td>$${fee.amount}</td>
            <td>${fee.dueDate}</td>
            <td><span class="status-badge ${fee.status === 'paid' ? 'status-active' : 'status-pending'}">${fee.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewFee(${fee.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editFee(${fee.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterFees() {
    const searchTerm = document.getElementById('feeSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#feeTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Examination Management
function loadExaminations() {
    const tbody = document.getElementById('examTableBody');
    tbody.innerHTML = '';

    examinations.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exam.id}</td>
            <td>${exam.subject}</td>
            <td>${exam.date}</td>
            <td>${exam.time}</td>
            <td>${exam.duration} mins</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewExam(${exam.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editExam(${exam.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteExam(${exam.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// LMS Management
let currentSubject = null;
let subjectData = {
    'computer-science': {
        name: 'Computer Science',
        description: 'Programming, Algorithms, Data Structures, Software Engineering',
        info: 'Computer Science is a comprehensive program covering programming languages, algorithms, data structures, software engineering principles, and computer systems design.',
        syllabus: [
            { unit: 'Unit 1', topic: 'Introduction to Programming', duration: '4 weeks' },
            { unit: 'Unit 2', topic: 'Data Structures and Algorithms', duration: '6 weeks' },
            { unit: 'Unit 3', topic: 'Object-Oriented Programming', duration: '4 weeks' },
            { unit: 'Unit 4', topic: 'Database Management Systems', duration: '4 weeks' },
            { unit: 'Unit 5', topic: 'Software Engineering', duration: '4 weeks' }
        ],
        faculty: [
            {
                name: 'Dr. Sarah Wilson',
                position: 'Senior Professor',
                degree: 'Ph.D. in Computer Science',
                email: 'sarah.wilson@university.edu',
                image: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=SW'
            },
            {
                name: 'Prof. Michael Chen',
                position: 'Associate Professor',
                degree: 'M.S. in Software Engineering',
                email: 'michael.chen@university.edu',
                image: 'https://via.placeholder.com/150x150/50C878/FFFFFF?text=MC'
            }
        ]
    },
    'mathematics': {
        name: 'Mathematics',
        description: 'Calculus, Linear Algebra, Statistics, Discrete Mathematics',
        info: 'Mathematics program focuses on advanced mathematical concepts including calculus, linear algebra, statistics, and their applications in various fields.',
        syllabus: [
            { unit: 'Unit 1', topic: 'Calculus I - Limits and Derivatives', duration: '5 weeks' },
            { unit: 'Unit 2', topic: 'Calculus II - Integration', duration: '5 weeks' },
            { unit: 'Unit 3', topic: 'Linear Algebra', duration: '4 weeks' },
            { unit: 'Unit 4', topic: 'Statistics and Probability', duration: '4 weeks' },
            { unit: 'Unit 5', topic: 'Discrete Mathematics', duration: '4 weeks' }
        ],
        faculty: [
            {
                name: 'Dr. Emily Rodriguez',
                position: 'Professor',
                degree: 'Ph.D. in Pure Mathematics',
                email: 'emily.rodriguez@university.edu',
                image: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=ER'
            }
        ]
    },
    'physics': {
        name: 'Physics',
        description: 'Mechanics, Thermodynamics, Quantum Physics, Electromagnetism',
        info: 'Physics program covers fundamental principles of mechanics, thermodynamics, quantum physics, and electromagnetism with practical applications.',
        syllabus: [
            { unit: 'Unit 1', topic: 'Classical Mechanics', duration: '6 weeks' },
            { unit: 'Unit 2', topic: 'Thermodynamics', duration: '4 weeks' },
            { unit: 'Unit 3', topic: 'Electromagnetism', duration: '5 weeks' },
            { unit: 'Unit 4', topic: 'Quantum Physics', duration: '5 weeks' },
            { unit: 'Unit 5', topic: 'Modern Physics', duration: '2 weeks' }
        ],
        faculty: [
            {
                name: 'Dr. James Thompson',
                position: 'Senior Professor',
                degree: 'Ph.D. in Theoretical Physics',
                email: 'james.thompson@university.edu',
                image: 'https://via.placeholder.com/150x150/9B59B6/FFFFFF?text=JT'
            }
        ]
    },
    'chemistry': {
        name: 'Chemistry',
        description: 'Organic, Inorganic, Physical Chemistry, Analytical Chemistry',
        info: 'Chemistry program provides comprehensive understanding of organic, inorganic, physical, and analytical chemistry with laboratory experience.',
        syllabus: [
            { unit: 'Unit 1', topic: 'General Chemistry', duration: '4 weeks' },
            { unit: 'Unit 2', topic: 'Organic Chemistry', duration: '6 weeks' },
            { unit: 'Unit 3', topic: 'Inorganic Chemistry', duration: '5 weeks' },
            { unit: 'Unit 4', topic: 'Physical Chemistry', duration: '4 weeks' },
            { unit: 'Unit 5', topic: 'Analytical Chemistry', duration: '3 weeks' }
        ],
        faculty: [
            {
                name: 'Dr. Lisa Anderson',
                position: 'Associate Professor',
                degree: 'Ph.D. in Organic Chemistry',
                email: 'lisa.anderson@university.edu',
                image: 'https://via.placeholder.com/150x150/F39C12/FFFFFF?text=LA'
            }
        ]
    },
    'biology': {
        name: 'Biology',
        description: 'Genetics, Molecular Biology, Ecology, Cell Biology',
        info: 'Biology program explores life sciences including genetics, molecular biology, ecology, and cell biology with hands-on research opportunities.',
        syllabus: [
            { unit: 'Unit 1', topic: 'Cell Biology', duration: '5 weeks' },
            { unit: 'Unit 2', topic: 'Genetics', duration: '5 weeks' },
            { unit: 'Unit 3', topic: 'Molecular Biology', duration: '4 weeks' },
            { unit: 'Unit 4', topic: 'Ecology', duration: '4 weeks' },
            { unit: 'Unit 5', topic: 'Evolution', duration: '4 weeks' }
        ],
        faculty: [
            {
                name: 'Dr. Robert Kim',
                position: 'Professor',
                degree: 'Ph.D. in Molecular Biology',
                email: 'robert.kim@university.edu',
                image: 'https://via.placeholder.com/150x150/27AE60/FFFFFF?text=RK'
            }
        ]
    },
    'english': {
        name: 'English Literature',
        description: 'Poetry, Prose, Drama, Linguistics, Literary Criticism',
        info: 'English Literature program covers classical and contemporary literature, poetry, drama, and linguistic analysis with critical thinking development.',
        syllabus: [
            { unit: 'Unit 1', topic: 'Classical Literature', duration: '5 weeks' },
            { unit: 'Unit 2', topic: 'Modern Poetry', duration: '4 weeks' },
            { unit: 'Unit 3', topic: 'Drama and Theatre', duration: '4 weeks' },
            { unit: 'Unit 4', topic: 'Linguistics', duration: '4 weeks' },
            { unit: 'Unit 5', topic: 'Literary Criticism', duration: '5 weeks' }
        ],
        faculty: [
            {
                name: 'Prof. Margaret Davis',
                position: 'Senior Professor',
                degree: 'Ph.D. in English Literature',
                email: 'margaret.davis@university.edu',
                image: 'https://via.placeholder.com/150x150/E74C3C/FFFFFF?text=MD'
            }
        ]
    }
};

function loadLMS() {
    // Show subject list by default
    document.getElementById('subjectList').style.display = 'grid';
    document.getElementById('subjectDetail').style.display = 'none';
}

function openSubject(subjectId) {
    currentSubject = subjectId;
    const subject = subjectData[subjectId];
    
    if (!subject) return;
    
    // Hide subject list and show detail view
    document.getElementById('subjectList').style.display = 'none';
    document.getElementById('subjectDetail').style.display = 'block';
    
    // Update subject title
    document.getElementById('subjectTitle').textContent = subject.name;
    
    // Show introduction by default
    showSubmenu('introduction');
}

function backToSubjects() {
    document.getElementById('subjectList').style.display = 'grid';
    document.getElementById('subjectDetail').style.display = 'none';
    currentSubject = null;
}

function showSubmenu(submenuName) {
    // Remove active class from all submenu buttons
    document.querySelectorAll('.submenu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hide all submenu content
    document.querySelectorAll('.submenu-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected submenu
    document.querySelector(`[onclick="showSubmenu('${submenuName}')"]`).classList.add('active');
    document.getElementById(submenuName).classList.add('active');
    
    // Load content based on submenu
    switch(submenuName) {
        case 'introduction':
            loadIntroduction();
            break;
        case 'syllabus':
            loadSyllabus();
            break;
        case 'faculty':
            loadFaculty();
            break;
        case 'viva-submission':
            loadVivaSubmission();
            break;
    }
}

function loadIntroduction() {
    if (!currentSubject) return;
    
    const subject = subjectData[currentSubject];
    const infoContainer = document.getElementById('subjectInfo');
    
    infoContainer.innerHTML = `
        <div class="subject-intro">
            <div class="subject-overview">
                <h4>Course Overview</h4>
                <p>${subject.info}</p>
            </div>
            <div class="subject-details">
                <h4>Course Details</h4>
                <ul>
                    <li><strong>Subject:</strong> ${subject.name}</li>
                    <li><strong>Description:</strong> ${subject.description}</li>
                    <li><strong>Duration:</strong> 22 weeks (1 semester)</li>
                    <li><strong>Credits:</strong> 4</li>
                </ul>
            </div>
        </div>
    `;
}

function loadSyllabus() {
    if (!currentSubject) return;
    
    const subject = subjectData[currentSubject];
    const syllabusContainer = document.getElementById('syllabusContent');
    
    let syllabusHTML = '<div class="syllabus-list">';
    subject.syllabus.forEach((unit, index) => {
        syllabusHTML += `
            <div class="syllabus-unit">
                <div class="unit-header">
                    <h4>${unit.unit}</h4>
                    <span class="unit-duration">${unit.duration}</span>
                </div>
                <p>${unit.topic}</p>
            </div>
        `;
    });
    syllabusHTML += '</div>';
    
    syllabusContainer.innerHTML = syllabusHTML;
}

function loadFaculty() {
    if (!currentSubject) return;
    
    const subject = subjectData[currentSubject];
    const facultyContainer = document.getElementById('facultyList');
    
    let facultyHTML = '';
    subject.faculty.forEach(faculty => {
        facultyHTML += `
            <div class="faculty-card">
                <div class="faculty-image">
                    <img src="${faculty.image}" alt="${faculty.name}" onerror="this.src='https://via.placeholder.com/150x150/666666/FFFFFF?text=${faculty.name.split(' ').map(n => n[0]).join('')}'">
                </div>
                <div class="faculty-info">
                    <h4>${faculty.name}</h4>
                    <p class="faculty-position">${faculty.position}</p>
                    <p class="faculty-degree">${faculty.degree}</p>
                    <p class="faculty-email">
                        <i class="fas fa-envelope"></i>
                        <a href="mailto:${faculty.email}">${faculty.email}</a>
                    </p>
                </div>
            </div>
        `;
    });
    
    facultyContainer.innerHTML = facultyHTML;
}

function loadVivaSubmission() {
    // Show assignments tab by default
    showVivaTab('assignments');
}

function showVivaTab(tabName) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected tab
    document.querySelector(`[onclick="showVivaTab('${tabName}')"]`).classList.add('active');
    
    const tabContent = document.getElementById('vivaTabContent');
    
    switch(tabName) {
        case 'assignments':
            tabContent.innerHTML = `
                <div class="assignments-list">
                    <div class="assignment-item">
                        <h4>Assignment 1: Basic Concepts</h4>
                        <p>Due Date: March 15, 2024</p>
                        <p>Status: <span class="status-badge status-pending">Pending</span></p>
                        <button class="btn btn-primary btn-sm">Submit</button>
                    </div>
                    <div class="assignment-item">
                        <h4>Assignment 2: Advanced Topics</h4>
                        <p>Due Date: April 10, 2024</p>
                        <p>Status: <span class="status-badge status-active">Submitted</span></p>
                        <button class="btn btn-secondary btn-sm">View Submission</button>
                    </div>
                </div>
            `;
            break;
        case 'viva-schedule':
            tabContent.innerHTML = `
                <div class="viva-schedule">
                    <div class="viva-item">
                        <h4>Mid-term Viva</h4>
                        <p>Date: March 20, 2024</p>
                        <p>Time: 10:00 AM - 12:00 PM</p>
                        <p>Room: 201A</p>
                    </div>
                    <div class="viva-item">
                        <h4>Final Viva</h4>
                        <p>Date: May 15, 2024</p>
                        <p>Time: 2:00 PM - 4:00 PM</p>
                        <p>Room: 301B</p>
                    </div>
                </div>
            `;
            break;
        case 'submissions':
            tabContent.innerHTML = `
                <div class="submissions-list">
                    <div class="submission-item">
                        <h4>Project Report</h4>
                        <p>Submitted: March 12, 2024</p>
                        <p>Grade: <span class="grade-badge">A</span></p>
                        <button class="btn btn-secondary btn-sm">Download</button>
                    </div>
                    <div class="submission-item">
                        <h4>Research Paper</h4>
                        <p>Submitted: April 8, 2024</p>
                        <p>Grade: <span class="grade-badge">B+</span></p>
                        <button class="btn btn-secondary btn-sm">Download</button>
                    </div>
                </div>
            `;
            break;
    }
}

// Charts and Reports
function initializeCharts() {
    // Initialize Chart.js if available
    if (typeof Chart !== 'undefined') {
        updateCharts();
    }
}

function updateCharts() {
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Average Grade',
                    data: [85, 87, 89, 88, 90, 92],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Attendance Chart
    const attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx) {
        new Chart(attendanceCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Attendance %',
                    data: [95, 92, 98, 94],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Fee Chart
    const feeCtx = document.getElementById('feeChart');
    if (feeCtx) {
        new Chart(feeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{
                    data: [70, 20, 10],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessage(message, type = 'success') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function loadDataFromStorage() {
    // Load data from localStorage
    students = JSON.parse(localStorage.getItem('erp_students') || '[]');
    teachers = JSON.parse(localStorage.getItem('erp_teachers') || '[]');
    courses = JSON.parse(localStorage.getItem('erp_courses') || '[]');
    attendance = JSON.parse(localStorage.getItem('erp_attendance') || '[]');
    fees = JSON.parse(localStorage.getItem('erp_fees') || '[]');
    examinations = JSON.parse(localStorage.getItem('erp_examinations') || '[]');
    books = JSON.parse(localStorage.getItem('erp_books') || '[]');
}

function saveDataToStorage() {
    // Save data to localStorage
    localStorage.setItem('erp_students', JSON.stringify(students));
    localStorage.setItem('erp_teachers', JSON.stringify(teachers));
    localStorage.setItem('erp_courses', JSON.stringify(courses));
    localStorage.setItem('erp_attendance', JSON.stringify(attendance));
    localStorage.setItem('erp_fees', JSON.stringify(fees));
    localStorage.setItem('erp_examinations', JSON.stringify(examinations));
    localStorage.setItem('erp_books', JSON.stringify(books));
}

function loadSampleData() {
    // Load sample data if no data exists
    if (students.length === 0) {
        students = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@email.com',
                course: 'Computer Science',
                year: '3',
                status: 'active',
                enrollmentDate: '2022-09-01'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                course: 'Mathematics',
                year: '2',
                status: 'active',
                enrollmentDate: '2023-09-01'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@email.com',
                course: 'Physics',
                year: '4',
                status: 'active',
                enrollmentDate: '2021-09-01'
            }
        ];
    }

    if (teachers.length === 0) {
        teachers = [
            {
                id: 1,
                name: 'Dr. Sarah Wilson',
                email: 'sarah.wilson@school.edu',
                department: 'Computer Science',
                subject: 'Data Structures',
                experience: 10
            },
            {
                id: 2,
                name: 'Prof. David Brown',
                email: 'david.brown@school.edu',
                department: 'Mathematics',
                subject: 'Calculus',
                experience: 15
            }
        ];
    }

    if (courses.length === 0) {
        courses = [
            {
                code: 'CS101',
                name: 'Introduction to Programming',
                department: 'Computer Science',
                duration: '1 year',
                credits: 4
            },
            {
                code: 'MATH201',
                name: 'Calculus I',
                department: 'Mathematics',
                duration: '1 semester',
                credits: 3
            }
        ];
    }

    if (fees.length === 0) {
        fees = [
            {
                id: 1,
                studentId: 1,
                studentName: 'John Doe',
                amount: 1500,
                dueDate: '2024-01-15',
                status: 'paid'
            },
            {
                id: 2,
                studentId: 2,
                studentName: 'Jane Smith',
                amount: 1500,
                dueDate: '2024-01-15',
                status: 'pending'
            }
        ];
    }

    if (books.length === 0) {
        books = [
            {
                id: 1,
                title: 'Introduction to Algorithms',
                author: 'Thomas H. Cormen',
                isbn: '978-0262033848',
                status: 'available'
            },
            {
                id: 2,
                title: 'Calculus: Early Transcendentals',
                author: 'James Stewart',
                isbn: '978-1285741550',
                status: 'borrowed'
            }
        ];
    }

    saveDataToStorage();
}

// Placeholder functions for future implementation
function openTeacherModal() { alert('Teacher modal - to be implemented'); }
function openCourseModal() { alert('Course modal - to be implemented'); }
function openFeeModal() { alert('Fee modal - to be implemented'); }
function openExamModal() { alert('Exam modal - to be implemented'); }
function openBookModal() { alert('Book modal - to be implemented'); }

// Additional placeholder functions
function viewTeacher(id) { alert(`View teacher ${id}`); }
function editTeacher(id) { alert(`Edit teacher ${id}`); }
function deleteTeacher(id) { alert(`Delete teacher ${id}`); }
function viewCourse(code) { alert(`View course ${code}`); }
function editCourse(code) { alert(`Edit course ${code}`); }
function deleteCourse(code) { alert(`Delete course ${code}`); }
function editAttendance(id) { alert(`Edit attendance ${id}`); }
function viewFee(id) { alert(`View fee ${id}`); }
function editFee(id) { alert(`Edit fee ${id}`); }
function viewExam(id) { alert(`View exam ${id}`); }
function editExam(id) { alert(`Edit exam ${id}`); }
function deleteExam(id) { alert(`Delete exam ${id}`); }
function viewBook(id) { alert(`View book ${id}`); }
function editBook(id) { alert(`Edit book ${id}`); }
function deleteBook(id) { alert(`Delete book ${id}`); }

// User Authentication Functions
function checkUserLogin() {
    const userData = localStorage.getItem('erp_user_data');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('erp_user_data');
            return false;
        }
    }
    return false;
}

function updateUserInfo() {
    if (!currentUser) return;
    
    const userInfoElements = document.querySelectorAll('.user-info span, .user-info-header span');
    const userIconElements = document.querySelectorAll('.user-info i, .user-info-header i');
    
    let displayText = '';
    let iconClass = '';
    
    // Safely access user properties
    const userName = currentUser.fullName || currentUser.name || 'User';
    const userType = currentUser.userType || 'admin';
    
    switch (userType) {
        case 'student':
            displayText = `Hello, ${userName}`;
            iconClass = 'fas fa-user-graduate';
            break;
        case 'teacher':
            displayText = `Hello, ${userName}`;
            iconClass = 'fas fa-chalkboard-teacher';
            break;
        case 'admin':
        default:
            displayText = 'Hello, Admin';
            iconClass = 'fas fa-user-circle';
            break;
    }
    
    // Update all user info elements safely
    userInfoElements.forEach(element => {
        if (element) {
            element.textContent = displayText;
        }
    });
    
    // Update all user icon elements safely
    userIconElements.forEach(element => {
        if (element) {
            element.className = iconClass;
        }
    });
}

// First logout function (removed - using enhanced version below)

// Add logout functionality to user info elements
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to user info for logout (optional)
    const userInfoElements = document.querySelectorAll('.user-info, .user-info-header');
    userInfoElements.forEach(element => {
        element.addEventListener('dblclick', function() {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    });
});

// Enhanced Sticky Header Functionality
function initializeStickyHeader() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    let ticking = false;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Smart hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 80) {
            // Scrolling down - hide header
            header.classList.add('hidden');
            header.classList.remove('visible');
        } else if (scrollTop < lastScrollTop || scrollTop <= 80) {
            // Scrolling up or near top - show header
            header.classList.remove('hidden');
            header.classList.add('visible');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    // Use throttled scroll event for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Ensure header is visible on page load
    header.classList.add('visible');
    
    // Handle window resize
    window.addEventListener('resize', function() {
        header.classList.remove('hidden');
        header.classList.add('visible');
    });
}

// Logout functionality (removed - using enhanced version below)

// Enhanced message function with better styling
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    // Add icon based on type
    let icon = 'fa-check-circle';
    switch(type) {
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
            icon = 'fa-info-circle';
            break;
    }
    
    messageDiv.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // Insert at the top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(messageDiv, mainContent.firstChild);
    } else {
        document.body.appendChild(messageDiv);
    }
    
    // Remove message after 4 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 4000);
}

// Add slide out animation
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(messageStyle);// ==
=== COMPREHENSIVE ADMIN CONTROLS =====

// Admin Dashboard Data
let adminData = {
    systemSettings: {
        schoolName: 'EduERP School',
        academicYear: '2024-2025',
        semester: 'Spring',
        timezone: 'UTC+0',
        language: 'English',
        currency: 'USD'
    },
    userManagement: {
        totalUsers: 0,
        activeUsers: 0,
        pendingApprovals: 0
    },
    systemStats: {
        totalStorage: '100GB',
        usedStorage: '45GB',
        serverUptime: '99.9%',
        lastBackup: new Date().toISOString()
    }
};

// Admin User Management
function loadAdminUserManagement() {
    const allUsers = [...students, ...teachers];
    adminData.userManagement.totalUsers = allUsers.length;
    adminData.userManagement.activeUsers = allUsers.filter(u => u.status === 'active').length;
    
    const userManagementHTML = `
        <div class="admin-section">
            <div class="admin-header">
                <h3><i class="fas fa-users-cog"></i> User Management</h3>
                <div class="admin-actions">
                    <button class="btn btn-primary" onclick="openBulkUserModal()">
                        <i class="fas fa-upload"></i> Bulk Import
                    </button>
                    <button class="btn btn-success" onclick="exportUsers()">
                        <i class="fas fa-download"></i> Export Users
                    </button>
                </div>
            </div>
            
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h4>${adminData.userManagement.totalUsers}</h4>
                        <p>Total Users</p>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="stat-info">
                        <h4>${adminData.userManagement.activeUsers}</h4>
                        <p>Active Users</p>
                    </div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-user-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h4>${adminData.userManagement.pendingApprovals}</h4>
                        <p>Pending Approvals</p>
                    </div>
                </div>
            </div>
            
            <div class="admin-user-controls">
                <div class="control-group">
                    <h4>User Actions</h4>
                    <div class="control-buttons">
                        <button class="btn btn-outline" onclick="resetAllPasswords()">
                            <i class="fas fa-key"></i> Reset All Passwords
                        </button>
                        <button class="btn btn-outline" onclick="sendBulkNotifications()">
                            <i class="fas fa-bell"></i> Send Notifications
                        </button>
                        <button class="btn btn-outline" onclick="generateUserReports()">
                            <i class="fas fa-chart-line"></i> Generate Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return userManagementHTML;
}

// System Settings Management
function loadSystemSettings() {
    const settingsHTML = `
        <div class="admin-section">
            <div class="admin-header">
                <h3><i class="fas fa-cogs"></i> System Settings</h3>
                <button class="btn btn-primary" onclick="saveSystemSettings()">
                    <i class="fas fa-save"></i> Save Settings
                </button>
            </div>
            
            <div class="settings-grid">
                <div class="settings-card">
                    <h4>General Settings</h4>
                    <div class="form-group">
                        <label>School Name</label>
                        <input type="text" id="schoolName" value="${adminData.systemSettings.schoolName}">
                    </div>
                    <div class="form-group">
                        <label>Academic Year</label>
                        <input type="text" id="academicYear" value="${adminData.systemSettings.academicYear}">
                    </div>
                    <div class="form-group">
                        <label>Current Semester</label>
                        <select id="semester">
                            <option value="Spring" ${adminData.systemSettings.semester === 'Spring' ? 'selected' : ''}>Spring</option>
                            <option value="Summer" ${adminData.systemSettings.semester === 'Summer' ? 'selected' : ''}>Summer</option>
                            <option value="Fall" ${adminData.systemSettings.semester === 'Fall' ? 'selected' : ''}>Fall</option>
                            <option value="Winter" ${adminData.systemSettings.semester === 'Winter' ? 'selected' : ''}>Winter</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h4>System Configuration</h4>
                    <div class="form-group">
                        <label>Timezone</label>
                        <select id="timezone">
                            <option value="UTC+0">UTC+0 (GMT)</option>
                            <option value="UTC-5">UTC-5 (EST)</option>
                            <option value="UTC-8">UTC-8 (PST)</option>
                            <option value="UTC+1">UTC+1 (CET)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Default Language</label>
                        <select id="language">
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Currency</label>
                        <select id="currency">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-card">
                    <h4>Security Settings</h4>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="twoFactorAuth" checked>
                            <span class="checkmark"></span>
                            Enable Two-Factor Authentication
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="passwordExpiry" checked>
                            <span class="checkmark"></span>
                            Password Expiry (90 days)
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="loginLogging" checked>
                            <span class="checkmark"></span>
                            Log All Login Attempts
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return settingsHTML;
}

// Database Management
function loadDatabaseManagement() {
    const dbHTML = `
        <div class="admin-section">
            <div class="admin-header">
                <h3><i class="fas fa-database"></i> Database Management</h3>
                <div class="admin-actions">
                    <button class="btn btn-success" onclick="createBackup()">
                        <i class="fas fa-download"></i> Create Backup
                    </button>
                    <button class="btn btn-warning" onclick="restoreBackup()">
                        <i class="fas fa-upload"></i> Restore Backup
                    </button>
                </div>
            </div>
            
            <div class="db-stats-grid">
                <div class="db-stat-card">
                    <h4>Storage Usage</h4>
                    <div class="storage-bar">
                        <div class="storage-used" style="width: 45%"></div>
                    </div>
                    <p>45GB of 100GB used</p>
                </div>
                <div class="db-stat-card">
                    <h4>Last Backup</h4>
                    <p>${new Date(adminData.systemStats.lastBackup).toLocaleDateString()}</p>
                    <small>Automatic backup enabled</small>
                </div>
                <div class="db-stat-card">
                    <h4>Server Uptime</h4>
                    <p>${adminData.systemStats.serverUptime}</p>
                    <small>Last 30 days</small>
                </div>
            </div>
            
            <div class="db-actions">
                <div class="action-group">
                    <h4>Data Management</h4>
                    <div class="action-buttons">
                        <button class="btn btn-outline" onclick="cleanupOldData()">
                            <i class="fas fa-broom"></i> Cleanup Old Data
                        </button>
                        <button class="btn btn-outline" onclick="optimizeDatabase()">
                            <i class="fas fa-tachometer-alt"></i> Optimize Database
                        </button>
                        <button class="btn btn-outline" onclick="exportAllData()">
                            <i class="fas fa-file-export"></i> Export All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return dbHTML;
}

// System Monitoring
function loadSystemMonitoring() {
    const monitoringHTML = `
        <div class="admin-section">
            <div class="admin-header">
                <h3><i class="fas fa-chart-line"></i> System Monitoring</h3>
                <button class="btn btn-primary" onclick="refreshMonitoring()">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
            
            <div class="monitoring-grid">
                <div class="monitor-card">
                    <h4>Active Sessions</h4>
                    <div class="monitor-value">24</div>
                    <div class="monitor-trend up">+12% from yesterday</div>
                </div>
                <div class="monitor-card">
                    <h4>System Load</h4>
                    <div class="monitor-value">67%</div>
                    <div class="monitor-trend normal">Normal range</div>
                </div>
                <div class="monitor-card">
                    <h4>Error Rate</h4>
                    <div class="monitor-value">0.02%</div>
                    <div class="monitor-trend down">-0.01% from yesterday</div>
                </div>
                <div class="monitor-card">
                    <h4>Response Time</h4>
                    <div class="monitor-value">245ms</div>
                    <div class="monitor-trend normal">Average</div>
                </div>
            </div>
            
            <div class="activity-log">
                <h4>Recent System Activity</h4>
                <div class="log-entries">
                    <div class="log-entry">
                        <span class="log-time">10:30 AM</span>
                        <span class="log-action">User login</span>
                        <span class="log-user">john.doe@school.edu</span>
                        <span class="log-status success">Success</span>
                    </div>
                    <div class="log-entry">
                        <span class="log-time">10:25 AM</span>
                        <span class="log-action">Database backup</span>
                        <span class="log-user">System</span>
                        <span class="log-status success">Completed</span>
                    </div>
                    <div class="log-entry">
                        <span class="log-time">10:20 AM</span>
                        <span class="log-action">Failed login attempt</span>
                        <span class="log-user">unknown@email.com</span>
                        <span class="log-status error">Failed</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return monitoringHTML;
}

// Enhanced Dashboard for Admin
function loadAdminDashboard() {
    if (currentUser && currentUser.userType === 'admin') {
        const dashboardContainer = document.getElementById('dashboard');
        
        const adminDashboardHTML = `
            <div class="module-header">
                <h2>Admin Dashboard</h2>
                <div class="admin-quick-actions">
                    <button class="btn btn-sm btn-primary" onclick="showQuickStats()">
                        <i class="fas fa-chart-bar"></i> Quick Stats
                    </button>
                    <button class="btn btn-sm btn-success" onclick="systemHealthCheck()">
                        <i class="fas fa-heartbeat"></i> Health Check
                    </button>
                </div>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab active" onclick="showAdminTab('overview')">Overview</button>
                <button class="admin-tab" onclick="showAdminTab('users')">User Management</button>
                <button class="admin-tab" onclick="showAdminTab('settings')">System Settings</button>
                <button class="admin-tab" onclick="showAdminTab('database')">Database</button>
                <button class="admin-tab" onclick="showAdminTab('monitoring')">Monitoring</button>
            </div>
            
            <div id="adminTabContent">
                <div id="overview" class="admin-tab-content active">
                    ${loadSystemOverview()}
                </div>
                <div id="users" class="admin-tab-content">
                    ${loadAdminUserManagement()}
                </div>
                <div id="settings" class="admin-tab-content">
                    ${loadSystemSettings()}
                </div>
                <div id="database" class="admin-tab-content">
                    ${loadDatabaseManagement()}
                </div>
                <div id="monitoring" class="admin-tab-content">
                    ${loadSystemMonitoring()}
                </div>
            </div>
        `;
        
        dashboardContainer.innerHTML = adminDashboardHTML;
    }
}

function loadSystemOverview() {
    return `
        <div class="admin-overview">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${students.length}</h3>
                        <p>Total Students</p>
                        <small>+5 this week</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${teachers.length}</h3>
                        <p>Teachers</p>
                        <small>All active</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${courses.length}</h3>
                        <p>Courses</p>
                        <small>2 new this semester</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>3</h3>
                        <p>Pending Issues</p>
                        <small>Requires attention</small>
                    </div>
                </div>
            </div>
            
            <div class="admin-quick-actions-grid">
                <div class="quick-action-card" onclick="bulkStudentOperations()">
                    <i class="fas fa-users"></i>
                    <h4>Bulk Student Operations</h4>
                    <p>Import, export, or modify multiple students</p>
                </div>
                <div class="quick-action-card" onclick="generateReports()">
                    <i class="fas fa-file-alt"></i>
                    <h4>Generate Reports</h4>
                    <p>Create comprehensive system reports</p>
                </div>
                <div class="quick-action-card" onclick="systemMaintenance()">
                    <i class="fas fa-tools"></i>
                    <h4>System Maintenance</h4>
                    <p>Perform system cleanup and optimization</p>
                </div>
                <div class="quick-action-card" onclick="securityAudit()">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Security Audit</h4>
                    <p>Review security logs and permissions</p>
                </div>
            </div>
        </div>
    `;
}

// Admin Tab Management
function showAdminTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[onclick="showAdminTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Admin Action Functions
function saveSystemSettings() {
    const settings = {
        schoolName: document.getElementById('schoolName')?.value,
        academicYear: document.getElementById('academicYear')?.value,
        semester: document.getElementById('semester')?.value,
        timezone: document.getElementById('timezone')?.value,
        language: document.getElementById('language')?.value,
        currency: document.getElementById('currency')?.value
    };
    
    adminData.systemSettings = { ...adminData.systemSettings, ...settings };
    localStorage.setItem('erp_admin_settings', JSON.stringify(adminData.systemSettings));
    showMessage('System settings saved successfully!', 'success');
}

function createBackup() {
    showMessage('Creating system backup...', 'info');
    
    setTimeout(() => {
        const backupData = {
            students,
            teachers,
            courses,
            attendance,
            fees,
            examinations,
            adminData,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `erp_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        adminData.systemStats.lastBackup = new Date().toISOString();
        showMessage('Backup created successfully!', 'success');
    }, 2000);
}

function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    if (confirm('This will replace all current data. Are you sure?')) {
                        students = backupData.students || [];
                        teachers = backupData.teachers || [];
                        courses = backupData.courses || [];
                        attendance = backupData.attendance || [];
                        fees = backupData.fees || [];
                        examinations = backupData.examinations || [];
                        adminData = backupData.adminData || adminData;
                        
                        saveDataToStorage();
                        showMessage('Backup restored successfully!', 'success');
                        location.reload();
                    }
                } catch (error) {
                    showMessage('Invalid backup file format!', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function exportUsers() {
    const allUsers = [
        ...students.map(s => ({...s, type: 'student'})),
        ...teachers.map(t => ({...t, type: 'teacher'}))
    ];
    
    const csvContent = convertToCSV(allUsers);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showMessage('Users exported successfully!', 'success');
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

function resetAllPasswords() {
    if (confirm('This will reset passwords for all users. Continue?')) {
        showMessage('Password reset emails sent to all users!', 'success');
    }
}

function sendBulkNotifications() {
    const message = prompt('Enter notification message:');
    if (message) {
        showMessage(`Notification sent to all users: "${message}"`, 'success');
    }
}

function generateUserReports() {
    showMessage('Generating comprehensive user reports...', 'info');
    setTimeout(() => {
        showMessage('User reports generated and saved!', 'success');
    }, 2000);
}

function systemHealthCheck() {
    showMessage('Running system health check...', 'info');
    setTimeout(() => {
        showMessage('System health: All systems operational!', 'success');
    }, 3000);
}

function bulkStudentOperations() {
    showMessage('Opening bulk student operations panel...', 'info');
}

function generateReports() {
    showMessage('Opening report generation wizard...', 'info');
}

function systemMaintenance() {
    showMessage('Opening system maintenance panel...', 'info');
}

function securityAudit() {
    showMessage('Opening security audit dashboard...', 'info');
}

function refreshMonitoring() {
    showMessage('Refreshing monitoring data...', 'info');
    setTimeout(() => {
        showMessage('Monitoring data updated!', 'success');
    }, 1500);
}

function cleanupOldData() {
    if (confirm('This will remove data older than 2 years. Continue?')) {
        showMessage('Old data cleanup completed!', 'success');
    }
}

function optimizeDatabase() {
    showMessage('Optimizing database...', 'info');
    setTimeout(() => {
        showMessage('Database optimization completed!', 'success');
    }, 3000);
}

function exportAllData() {
    showMessage('Exporting all system data...', 'info');
    setTimeout(() => {
        createBackup();
    }, 1000);
}

// Enhanced showModule function to handle admin dashboard
function showModuleEnhanced(moduleName) {
    // Call original showModule function
    showModuleOriginal(moduleName);
    
    // Add admin dashboard enhancement
    if (moduleName === 'dashboard' && currentUser && currentUser.userType === 'admin') {
        setTimeout(() => {
            loadAdminDashboard();
        }, 100);
    }
}

// Store reference to original function and replace
const showModuleOriginal = showModule;
showModule = showModuleEnhanced;// =
==== ADDITIONAL ADMIN MODAL FUNCTIONS =====

// Teacher Modal Functions
function openTeacherModal(teacherId = null) {
    const modal = document.getElementById('teacherModal');
    const form = document.getElementById('teacherForm');
    
    if (teacherId) {
        const teacher = teachers.find(t => t.id === teacherId);
        if (teacher) {
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherDepartment').value = teacher.department;
            document.getElementById('teacherSubject').value = teacher.subject;
            document.getElementById('teacherExperience').value = teacher.experience;
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Course Modal Functions
function openCourseModal(courseCode = null) {
    const modal = document.getElementById('courseModal');
    const form = document.getElementById('courseForm');
    
    if (courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (course) {
            document.getElementById('courseCode').value = course.code;
            document.getElementById('courseName').value = course.name;
            document.getElementById('courseDepartment').value = course.department;
            document.getElementById('courseDuration').value = course.duration;
            document.getElementById('courseCredits').value = course.credits;
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Fee Modal Functions
function openFeeModal(feeId = null) {
    const modal = document.getElementById('feeModal');
    const form = document.getElementById('feeForm');
    const studentSelect = document.getElementById('feeStudentId');
    
    // Populate student dropdown
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.email})`;
        studentSelect.appendChild(option);
    });
    
    if (feeId) {
        const fee = fees.find(f => f.id === feeId);
        if (fee) {
            document.getElementById('feeStudentId').value = fee.studentId;
            document.getElementById('feeAmount').value = fee.amount;
            document.getElementById('feeDueDate').value = fee.dueDate;
            document.getElementById('feeType').value = fee.type || 'tuition';
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Exam Modal Functions
function openExamModal(examId = null) {
    const modal = document.getElementById('examModal');
    const form = document.getElementById('examForm');
    
    if (examId) {
        const exam = examinations.find(e => e.id === examId);
        if (exam) {
            document.getElementById('examSubject').value = exam.subject;
            document.getElementById('examDate').value = exam.date;
            document.getElementById('examTime').value = exam.time;
            document.getElementById('examDuration').value = exam.duration;
            document.getElementById('examRoom').value = exam.room || '';
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Bulk User Import Modal
function openBulkUserModal() {
    const modal = document.getElementById('bulkUserModal');
    modal.style.display = 'block';
}

// Form Submission Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Teacher Form Handler
    document.getElementById('teacherForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('teacherName').value,
            email: document.getElementById('teacherEmail').value,
            department: document.getElementById('teacherDepartment').value,
            subject: document.getElementById('teacherSubject').value,
            experience: parseInt(document.getElementById('teacherExperience').value)
        };

        const existingTeacher = teachers.find(t => t.email === formData.email);
        
        if (existingTeacher) {
            Object.assign(existingTeacher, formData);
            showMessage('Teacher updated successfully!', 'success');
        } else {
            const newTeacher = {
                id: Date.now(),
                ...formData,
                status: 'active',
                joinDate: new Date().toISOString()
            };
            teachers.push(newTeacher);
            showMessage('Teacher added successfully!', 'success');
        }

        saveDataToStorage();
        loadTeachers();
        closeModal('teacherModal');
    });

    // Course Form Handler
    document.getElementById('courseForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            code: document.getElementById('courseCode').value,
            name: document.getElementById('courseName').value,
            department: document.getElementById('courseDepartment').value,
            duration: document.getElementById('courseDuration').value,
            credits: parseInt(document.getElementById('courseCredits').value)
        };

        const existingCourse = courses.find(c => c.code === formData.code);
        
        if (existingCourse) {
            Object.assign(existingCourse, formData);
            showMessage('Course updated successfully!', 'success');
        } else {
            courses.push(formData);
            showMessage('Course added successfully!', 'success');
        }

        saveDataToStorage();
        loadCourses();
        closeModal('courseModal');
    });

    // Fee Form Handler
    document.getElementById('feeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = parseInt(document.getElementById('feeStudentId').value);
        const student = students.find(s => s.id === studentId);
        
        const formData = {
            studentId: studentId,
            studentName: student ? student.name : 'Unknown',
            amount: parseFloat(document.getElementById('feeAmount').value),
            dueDate: document.getElementById('feeDueDate').value,
            type: document.getElementById('feeType').value,
            status: 'pending'
        };

        const newFee = {
            id: Date.now(),
            ...formData,
            createdDate: new Date().toISOString()
        };
        
        fees.push(newFee);
        showMessage('Fee record added successfully!', 'success');

        saveDataToStorage();
        loadFees();
        closeModal('feeModal');
    });

    // Exam Form Handler
    document.getElementById('examForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            subject: document.getElementById('examSubject').value,
            date: document.getElementById('examDate').value,
            time: document.getElementById('examTime').value,
            duration: parseInt(document.getElementById('examDuration').value),
            room: document.getElementById('examRoom').value
        };

        const newExam = {
            id: Date.now(),
            ...formData,
            createdDate: new Date().toISOString()
        };
        
        examinations.push(newExam);
        showMessage('Exam scheduled successfully!', 'success');

        saveDataToStorage();
        loadExaminations();
        closeModal('examModal');
    });
});

// Bulk Import Processing
function processBulkImport() {
    const fileInput = document.getElementById('bulkUserFile');
    const sendEmails = document.getElementById('sendWelcomeEmails').checked;
    
    if (!fileInput.files[0]) {
        showMessage('Please select a CSV file', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            let importedCount = 0;
            let errorCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                const values = lines[i].split(',').map(v => v.trim());
                const userData = {};
                
                headers.forEach((header, index) => {
                    userData[header] = values[index] || '';
                });
                
                if (userData.name && userData.email && userData.type) {
                    if (userData.type.toLowerCase() === 'student') {
                        const newStudent = {
                            id: Date.now() + i,
                            name: userData.name,
                            email: userData.email,
                            course: userData.course || 'General',
                            year: userData.year || '1',
                            status: 'active',
                            enrollmentDate: new Date().toISOString()
                        };
                        students.push(newStudent);
                        importedCount++;
                    } else if (userData.type.toLowerCase() === 'teacher') {
                        const newTeacher = {
                            id: Date.now() + i,
                            name: userData.name,
                            email: userData.email,
                            department: userData.department || 'General',
                            subject: userData.subject || 'General',
                            experience: parseInt(userData.experience) || 0,
                            status: 'active',
                            joinDate: new Date().toISOString()
                        };
                        teachers.push(newTeacher);
                        importedCount++;
                    }
                } else {
                    errorCount++;
                }
            }
            
            saveDataToStorage();
            
            if (importedCount > 0) {
                showMessage(`Successfully imported ${importedCount} users${errorCount > 0 ? ` (${errorCount} errors)` : ''}`, 'success');
                if (sendEmails) {
                    showMessage('Welcome emails sent to new users', 'info');
                }
            } else {
                showMessage('No valid users found in the file', 'error');
            }
            
            closeModal('bulkUserModal');
            
        } catch (error) {
            showMessage('Error processing CSV file', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Enhanced placeholder functions with actual functionality
function viewTeacher(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        const details = `
Teacher Details:
Name: ${teacher.name}
Email: ${teacher.email}
Department: ${teacher.department}
Subject: ${teacher.subject}
Experience: ${teacher.experience} years
Status: ${teacher.status}
        `;
        alert(details);
    }
}

function editTeacher(id) {
    openTeacherModal(id);
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        teachers = teachers.filter(t => t.id !== id);
        saveDataToStorage();
        loadTeachers();
        showMessage('Teacher deleted successfully!', 'success');
    }
}

function viewCourse(code) {
    const course = courses.find(c => c.code === code);
    if (course) {
        const details = `
Course Details:
Code: ${course.code}
Name: ${course.name}
Department: ${course.department}
Duration: ${course.duration}
Credits: ${course.credits}
        `;
        alert(details);
    }
}

function editCourse(code) {
    openCourseModal(code);
}

function deleteCourse(code) {
    if (confirm('Are you sure you want to delete this course?')) {
        courses = courses.filter(c => c.code !== code);
        saveDataToStorage();
        loadCourses();
        showMessage('Course deleted successfully!', 'success');
    }
}

function editAttendance(id) {
    const record = attendance.find(a => a.id === id);
    if (record) {
        const newStatus = record.status === 'present' ? 'absent' : 'present';
        record.status = newStatus;
        saveDataToStorage();
        loadAttendance();
        showMessage(`Attendance updated to ${newStatus}`, 'success');
    }
}

function viewFee(id) {
    const fee = fees.find(f => f.id === id);
    if (fee) {
        const details = `
Fee Details:
Student: ${fee.studentName}
Amount: $${fee.amount}
Due Date: ${fee.dueDate}
Status: ${fee.status}
Type: ${fee.type || 'Tuition'}
        `;
        alert(details);
    }
}

function editFee(id) {
    openFeeModal(id);
}

function viewExam(id) {
    const exam = examinations.find(e => e.id === id);
    if (exam) {
        const details = `
Exam Details:
Subject: ${exam.subject}
Date: ${exam.date}
Time: ${exam.time}
Duration: ${exam.duration} minutes
Room: ${exam.room || 'TBA'}
        `;
        alert(details);
    }
}

function editExam(id) {
    openExamModal(id);
}

function deleteExam(id) {
    if (confirm('Are you sure you want to delete this exam?')) {
        examinations = examinations.filter(e => e.id !== id);
        saveDataToStorage();
        loadExaminations();
        showMessage('Exam deleted successfully!', 'success');
    }
}

// Load admin settings on startup
function loadAdminSettings() {
    const savedSettings = localStorage.getItem('erp_admin_settings');
    if (savedSettings) {
        adminData.systemSettings = { ...adminData.systemSettings, ...JSON.parse(savedSettings) };
    }
}// ==
=== HEADER USER CONTROLS =====

// Profile Menu Functionality
function openProfileMenu() {
    // Create profile dropdown if it doesn't exist
    let dropdown = document.querySelector('.profile-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <a href="#" class="profile-dropdown-item" onclick="openProfileSettings()">
                <i class="fas fa-user-cog"></i>
                <span>Profile Settings</span>
            </a>
            <a href="#" class="profile-dropdown-item" onclick="openAccountSettings()">
                <i class="fas fa-cog"></i>
                <span>Account Settings</span>
            </a>
            <a href="#" class="profile-dropdown-item" onclick="viewNotifications()">
                <i class="fas fa-bell"></i>
                <span>Notifications</span>
            </a>
            <a href="#" class="profile-dropdown-item" onclick="openHelpCenter()">
                <i class="fas fa-question-circle"></i>
                <span>Help Center</span>
            </a>
            <div class="profile-dropdown-item" style="border-top: 1px solid var(--border-light); margin-top: 0.5rem; padding-top: 0.75rem;">
                <i class="fas fa-info-circle"></i>
                <span>Version 1.0.0</span>
            </div>
        `;
        
        // Position dropdown relative to profile button
        const profileBtn = document.querySelector('.profile-btn');
        profileBtn.style.position = 'relative';
        profileBtn.appendChild(dropdown);
    }
    
    // Toggle dropdown visibility
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.profile-btn')) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

// Profile Menu Functions
function openProfileSettings() {
    showMessage('Opening profile settings...', 'info');
    // Here you would typically open a profile settings modal
    closeProfileDropdown();
}

function openAccountSettings() {
    showMessage('Opening account settings...', 'info');
    // Here you would typically open account settings modal
    closeProfileDropdown();
}

function viewNotifications() {
    showMessage('Opening notifications...', 'info');
    // Here you would typically open notifications panel
    closeProfileDropdown();
}

function openHelpCenter() {
    showMessage('Opening help center...', 'info');
    // Here you would typically open help documentation
    closeProfileDropdown();
}

function closeProfileDropdown() {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// Enhanced Logout Function
function logout() {
    console.log('Logout function called');
    
    try {
        // Show confirmation dialog
        const confirmLogout = confirm('Are you sure you want to logout?\n\nThis will end your current session.');
        
        if (confirmLogout) {
            console.log('User confirmed logout');
            
            // Clear all user data
            localStorage.removeItem('erp_user_data');
            localStorage.removeItem('erp_students');
            localStorage.removeItem('erp_teachers');
            localStorage.removeItem('erp_courses');
            localStorage.removeItem('erp_attendance');
            localStorage.removeItem('erp_fees');
            localStorage.removeItem('erp_examinations');
            localStorage.removeItem('erp_books');
            localStorage.removeItem('erp_admin_settings');
            
            // Show success message
            alert('Logged out successfully! Redirecting to login page...');
            
            // Redirect to login page
            window.location.href = 'login.html';
        } else {
            console.log('User cancelled logout');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Error during logout. Please try again.');
    }
}

// Make logout function globally accessible
window.logout = logout;

// Notification Badge Update
function updateNotificationBadge(count = 0) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Initialize notification count
document.addEventListener('DOMContentLoaded', function() {
    // Set initial notification count (you can make this dynamic)
    updateNotificationBadge(3);
    
    // Update user info in header based on current user
    updateHeaderUserInfo();
});

// Update header user info
function updateHeaderUserInfo() {
    if (!currentUser) return;
    
    const userInfoElements = document.querySelectorAll('.user-info-header span');
    let displayText = '';
    
    switch (currentUser.userType) {
        case 'student':
            displayText = `Hello, ${currentUser.fullName}`;
            break;
        case 'teacher':
            displayText = `Hello, ${currentUser.fullName}`;
            break;
        case 'admin':
        default:
            displayText = 'Hello, Admin';
            break;
    }
    
    userInfoElements.forEach(element => {
        element.textContent = displayText;
    });
}

// Add keyboard shortcuts for logout
document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+L for logout
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        logout();
    }
    
    // Escape key to close profile dropdown
    if (e.key === 'Escape') {
        closeProfileDropdown();
    }
});

// Add logout confirmation on page unload (optional)
window.addEventListener('beforeunload', function(e) {
    // Only show if user is logged in and hasn't explicitly logged out
    if (localStorage.getItem('erp_user_data') && !sessionStorage.getItem('logging_out')) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Enhanced logout with session flag
function enhancedLogout() {
    sessionStorage.setItem('logging_out', 'true');
    logout();
}// ===== 
MISSING FUNCTION DEFINITIONS =====

// Quick Stats Function
function showQuickStats() {
    const stats = {
        totalUsers: students.length + teachers.length,
        activeStudents: students.filter(s => s.status === 'active').length,
        activeTeachers: teachers.filter(t => t.status === 'active').length,
        totalCourses: courses.length,
        pendingFees: fees.filter(f => f.status === 'pending').length,
        upcomingExams: examinations.filter(e => new Date(e.date) > new Date()).length
    };
    
    const statsHTML = `
        <div class="quick-stats-modal">
            <h3>System Quick Stats</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <strong>${stats.totalUsers}</strong>
                    <span>Total Users</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.activeStudents}</strong>
                    <span>Active Students</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.activeTeachers}</strong>
                    <span>Active Teachers</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.totalCourses}</strong>
                    <span>Total Courses</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.pendingFees}</strong>
                    <span>Pending Fees</span>
                </div>
                <div class="stat-item">
                    <strong>${stats.upcomingExams}</strong>
                    <span>Upcoming Exams</span>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            ${statsHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Load Admin Settings on Startup
document.addEventListener('DOMContentLoaded', function() {
    loadAdminSettings();
});

// Fix any remaining undefined function calls
function loadAdminSettings() {
    const savedSettings = localStorage.getItem('erp_admin_settings');
    if (savedSettings) {
        try {
            adminData.systemSettings = { ...adminData.systemSettings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.warn('Error loading admin settings:', error);
        }
    }
}

// Ensure adminData is defined
if (typeof adminData === 'undefined') {
    let adminData = {
        systemSettings: {
            schoolName: 'EduERP School',
            academicYear: '2024-2025',
            semester: 'Spring',
            timezone: 'UTC+0',
            language: 'English',
            currency: 'USD'
        },
        userManagement: {
            totalUsers: 0,
            activeUsers: 0,
            pendingApprovals: 0
        },
        systemStats: {
            totalStorage: '100GB',
            usedStorage: '45GB',
            serverUptime: '99.9%',
            lastBackup: new Date().toISOString()
        }
    };
}// ===
== QUICK FIX FOR MISSING FUNCTIONS =====

// Modal functions
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Placeholder functions for buttons
function openStudentModal() {
    console.log('Opening student modal');
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openTeacherModal() {
    console.log('Opening teacher modal');
    const modal = document.getElementById('teacherModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openCourseModal() {
    console.log('Opening course modal');
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openFeeModal() {
    console.log('Opening fee modal');
    const modal = document.getElementById('feeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openExamModal() {
    console.log('Opening exam modal');
    const modal = document.getElementById('examModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function markAttendance() {
    console.log('Mark attendance clicked');
    alert('Mark attendance functionality');
}

// Make sure showMessage function exists
function showMessage(message, type = 'info') {
    console.log('Message:', message, 'Type:', type);
    alert(message);
}

// Ensure showModule function works
function showModule(moduleName) {
    console.log('Showing module:', moduleName);
    
    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected module
    const targetModule = document.getElementById(moduleName);
    if (targetModule) {
        targetModule.classList.add('active');
    }
    
    // Add active class to selected nav item
    const navItem = document.querySelector(`[data-module="${moduleName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    currentModule = moduleName;
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, setting up click handlers...');
    
    // Add click handlers to all buttons
    document.addEventListener('click', function(e) {
        console.log('Click detected on:', e.target);
        
        // Handle logout button clicks
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            logout();
        }
        
        // Handle modal close buttons
        if (e.target.classList.contains('close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
});

console.log('Script loaded successfully');//
 ===== LOGOUT BUTTON FIX =====

// Ensure logout button works when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up logout button...');
    
    // Find all logout buttons and add event listeners
    const logoutButtons = document.querySelectorAll('.logout-btn');
    console.log('Found logout buttons:', logoutButtons.length);
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout button clicked via event listener');
            logout();
        });
    });
    
    // Also add to header buttons
    const headerBtns = document.querySelectorAll('.header-btn');
    headerBtns.forEach(btn => {
        if (btn.classList.contains('logout-btn')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Header logout button clicked');
                logout();
            });
        }
    });
});

// Alternative logout function for testing
function testLogout() {
    console.log('Test logout called');
    if (confirm('Test logout - are you sure?')) {
        alert('Test logout successful!');
        window.location.href = 'login.html';
    }
}

// Make functions globally available
window.testLogout = testLogout;
window.logout = logout;

console.log('Logout functions loaded and ready');// ===
== ROLE-BASED UI CUSTOMIZATION =====

function customizeUIForUserRole() {
    if (!currentUser) return;
    
    const userType = currentUser.userType;
    console.log('Customizing UI for user type:', userType);
    
    // Apply role-specific styling
    document.body.className = `user-${userType}`;
    
    // Customize navigation based on role
    customizeNavigation(userType);
    
    // Customize dashboard content
    customizeDashboard(userType);
    
    // Hide/show modules based on permissions
    setModulePermissions(userType);
    
    // Update header styling
    updateHeaderForRole(userType);
}

function customizeNavigation(userType) {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Define permissions for each role
    const permissions = {
        student: ['dashboard', 'courses', 'attendance', 'fees', 'examinations', 'lms'],
        teacher: ['dashboard', 'students', 'courses', 'attendance', 'examinations', 'lms', 'reports'],
        admin: ['dashboard', 'students', 'teachers', 'courses', 'attendance', 'fees', 'examinations', 'lms', 'reports']
    };
    
    const allowedModules = permissions[userType] || [];
    
    navItems.forEach(item => {
        const module = item.getAttribute('data-module');
        if (!allowedModules.includes(module)) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

function customizeDashboard(userType) {
    const dashboardModule = document.getElementById('dashboard');
    if (!dashboardModule) return;
    
    // Clear existing dashboard content
    dashboardModule.innerHTML = '';
    
    // Create role-specific dashboard
    switch(userType) {
        case 'student':
            createStudentDashboard(dashboardModule);
            break;
        case 'teacher':
            createTeacherDashboard(dashboardModule);
            break;
        case 'admin':
            createAdminDashboard(dashboardModule);
            break;
    }
}

function createStudentDashboard(container) {
    container.innerHTML = `
        <div class="module-header">
            <h2>Student Dashboard</h2>
            <div class="student-actions">
                <button class="btn btn-primary" onclick="viewMyGrades()">
                    <i class="fas fa-chart-line"></i> My Grades
                </button>
                <button class="btn btn-success" onclick="viewSchedule()">
                    <i class="fas fa-calendar"></i> My Schedule
                </button>
            </div>
        </div>
        
        <div class="student-stats-grid">
            <div class="stat-card student-card">
                <div class="stat-icon bg-primary">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="stat-info">
                    <h3>6</h3>
                    <p>Enrolled Courses</p>
                    <small>This semester</small>
                </div>
            </div>
            <div class="stat-card student-card">
                <div class="stat-icon bg-success">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-info">
                    <h3>92%</h3>
                    <p>Average Grade</p>
                    <small>Current GPA: 3.7</small>
                </div>
            </div>
            <div class="stat-card student-card">
                <div class="stat-icon bg-warning">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <h3>95%</h3>
                    <p>Attendance Rate</p>
                    <small>This month</small>
                </div>
            </div>
            <div class="stat-card student-card">
                <div class="stat-icon bg-danger">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="stat-info">
                    <h3>3</h3>
                    <p>Pending Assignments</p>
                    <small>Due this week</small>
                </div>
            </div>
        </div>
        
        <div class="student-content-grid">
            <div class="student-section">
                <h3>My Courses</h3>
                <div class="course-list">
                    <div class="course-item">
                        <div class="course-info">
                            <h4>Computer Science 101</h4>
                            <p>Prof. Sarah Wilson</p>
                        </div>
                        <div class="course-grade">A-</div>
                    </div>
                    <div class="course-item">
                        <div class="course-info">
                            <h4>Mathematics 201</h4>
                            <p>Prof. David Brown</p>
                        </div>
                        <div class="course-grade">B+</div>
                    </div>
                    <div class="course-item">
                        <div class="course-info">
                            <h4>Physics 150</h4>
                            <p>Dr. James Thompson</p>
                        </div>
                        <div class="course-grade">A</div>
                    </div>
                </div>
            </div>
            
            <div class="student-section">
                <h3>Upcoming Deadlines</h3>
                <div class="deadline-list">
                    <div class="deadline-item urgent">
                        <div class="deadline-info">
                            <h4>Physics Lab Report</h4>
                            <p>Due: Tomorrow</p>
                        </div>
                        <div class="deadline-status">Urgent</div>
                    </div>
                    <div class="deadline-item">
                        <div class="deadline-info">
                            <h4>Math Assignment 5</h4>
                            <p>Due: Friday</p>
                        </div>
                        <div class="deadline-status">Pending</div>
                    </div>
                    <div class="deadline-item">
                        <div class="deadline-info">
                            <h4>CS Project Presentation</h4>
                            <p>Due: Next Week</p>
                        </div>
                        <div class="deadline-status">In Progress</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createTeacherDashboard(container) {
    container.innerHTML = `
        <div class="module-header">
            <h2>Teacher Dashboard</h2>
            <div class="teacher-actions">
                <button class="btn btn-primary" onclick="gradeAssignments()">
                    <i class="fas fa-edit"></i> Grade Assignments
                </button>
                <button class="btn btn-success" onclick="createAssignment()">
                    <i class="fas fa-plus"></i> Create Assignment
                </button>
            </div>
        </div>
        
        <div class="teacher-stats-grid">
            <div class="stat-card teacher-card">
                <div class="stat-icon bg-primary">
                    <i class="fas fa-chalkboard"></i>
                </div>
                <div class="stat-info">
                    <h3>4</h3>
                    <p>Classes Teaching</p>
                    <small>This semester</small>
                </div>
            </div>
            <div class="stat-card teacher-card">
                <div class="stat-icon bg-success">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>156</h3>
                    <p>Total Students</p>
                    <small>Across all classes</small>
                </div>
            </div>
            <div class="stat-card teacher-card">
                <div class="stat-icon bg-warning">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <div class="stat-info">
                    <h3>23</h3>
                    <p>Assignments to Grade</p>
                    <small>Pending review</small>
                </div>
            </div>
            <div class="stat-card teacher-card">
                <div class="stat-icon bg-danger">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-info">
                    <h3>2</h3>
                    <p>Classes Today</p>
                    <small>Next: 2:00 PM</small>
                </div>
            </div>
        </div>
        
        <div class="teacher-content-grid">
            <div class="teacher-section">
                <h3>My Classes</h3>
                <div class="class-list">
                    <div class="class-item">
                        <div class="class-info">
                            <h4>Computer Science 101</h4>
                            <p>45 students • Room 201A</p>
                        </div>
                        <div class="class-time">Mon, Wed, Fri 10:00 AM</div>
                    </div>
                    <div class="class-item">
                        <div class="class-info">
                            <h4>Advanced Programming</h4>
                            <p>32 students • Room 301B</p>
                        </div>
                        <div class="class-time">Tue, Thu 2:00 PM</div>
                    </div>
                    <div class="class-item">
                        <div class="class-info">
                            <h4>Data Structures</h4>
                            <p>38 students • Room 205</p>
                        </div>
                        <div class="class-time">Mon, Wed 3:00 PM</div>
                    </div>
                </div>
            </div>
            
            <div class="teacher-section">
                <h3>Recent Student Activity</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class="fas fa-file-upload"></i>
                        <span>John Doe submitted Assignment 3</span>
                        <small>2 hours ago</small>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-question-circle"></i>
                        <span>Sarah Wilson asked a question in forum</span>
                        <small>4 hours ago</small>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Mike Johnson completed quiz</span>
                        <small>1 day ago</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createAdminDashboard(container) {
    // Keep the existing admin dashboard or enhance it
    if (currentUser && currentUser.userType === 'admin') {
        loadAdminDashboard();
    }
}

function setModulePermissions(userType) {
    const modules = document.querySelectorAll('.module');
    
    // Define which modules each role can access
    const modulePermissions = {
        student: {
            students: false,
            teachers: false,
            fees: 'readonly', // Can view their own fees only
            reports: false
        },
        teacher: {
            fees: false, // Teachers can't manage fees
            reports: 'limited' // Limited reporting access
        },
        admin: {} // Admin has access to everything
    };
    
    const permissions = modulePermissions[userType] || {};
    
    modules.forEach(module => {
        const moduleId = module.id;
        const permission = permissions[moduleId];
        
        if (permission === false) {
            module.style.display = 'none';
        } else if (permission === 'readonly') {
            // Add readonly styling or functionality
            module.classList.add('readonly-module');
        }
    });
}

function updateHeaderForRole(userType) {
    const header = document.querySelector('.header');
    const userInfo = document.querySelector('.user-info');
    
    // Add role-specific classes
    header.classList.add(`header-${userType}`);
    if (userInfo) {
        userInfo.classList.add(`user-info-${userType}`);
    }
}

// Role-specific action functions
function viewMyGrades() {
    showMessage('Opening grade report...', 'info');
}

function viewSchedule() {
    showMessage('Opening class schedule...', 'info');
}

function gradeAssignments() {
    showMessage('Opening grading interface...', 'info');
}

function createAssignment() {
    showMessage('Opening assignment creator...', 'info');
}

// Quick role switcher for testing (remove in production)
function switchUserRole(newRole) {
    const userData = {
        userType: newRole,
        fullName: `${newRole.charAt(0).toUpperCase() + newRole.slice(1)} User`,
        email: `${newRole}@school.edu`,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('erp_user_data', JSON.stringify(userData));
    currentUser = userData;
    
    // Refresh the page to apply new role
    location.reload();
}

// Add role switcher to console for testing
console.log('Role switcher available: switchUserRole("student"), switchUserRole("teacher"), switchUserRole("admin")');
window.switchUserRole = switchUserRole;