import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, orderBy } from 'firebase/firestore';

export const getStudentEnrollments = async (studentId) => {
  const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data().courseId);
};

export const getCoursesByIds = async (courseIds) => {
  if (courseIds.length === 0) return [];
  const q = query(collection(db, 'courses'), where('__name__', 'in', courseIds));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};


export const registerForCourse = async (studentId, courseId) => {
  await addDoc(collection(db, 'enrollments'), {
    studentId,
    courseId,
    semester: '2024-Spring',
    enrolledAt: new Date(),
    status: 'active'
  });
};

export const getStudentGrades = async (studentId) => {
  const q = query(collection(db, 'grades'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAnnouncements = async () => {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

const courseMatchesLecturer = (course, lecturerId, lecturerEmail, lecturerName) => {
  const lecturerIds = [
    course.lecturerId,
    course.instructorId,
    course.teacherId,
    course.professorId,
    course.lecturerUid,
    course.instructorUid,
    course.teacherUid,
    course.professorUid,
    course.lecturer_id,
    course.instructor_id,
    course.teacher_id,
    course.professor_id,
  ].filter(Boolean).map(String);

  const lecturerEmails = [
    course.lecturerEmail,
    course.instructorEmail,
    course.teacherEmail,
    course.professorEmail,
    course.lecturer_email,
    course.instructor_email,
    course.teacher_email,
    course.professor_email,
  ].filter(Boolean).map(String).map(e => e.toLowerCase());

  const lecturerNames = [
    course.lecturerName,
    course.instructorName,
    course.teacherName,
    course.professorName,
    course.lecturer_name,
    course.instructor_name,
    course.teacher_name,
    course.professor_name,
  ].filter(Boolean).map(String).map(n => n.toLowerCase());

  const normalizedUid = String(lecturerId);
  const normalizedEmail = lecturerEmail?.toLowerCase?.();
  const normalizedName = lecturerName?.toLowerCase?.();

  return (
    lecturerIds.includes(normalizedUid) ||
    (normalizedEmail && lecturerEmails.includes(normalizedEmail)) ||
    (normalizedName && lecturerNames.includes(normalizedName))
  );
};

export const getLecturerCourses = async (lecturerId, lecturerEmail, lecturerName) => {
  const q = query(collection(db, 'courses'), where('lecturerId', '==', lecturerId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const allCoursesSnapshot = await getDocs(collection(db, 'courses'));
  return allCoursesSnapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(course => courseMatchesLecturer(course, lecturerId, lecturerEmail, lecturerName));
};

export const getStudentsInCourse = async (courseId) => {
  const enrollmentQueries = [
    query(collection(db, 'enrollments'), where('courseId', '==', courseId), where('status', '==', 'active')),
    query(collection(db, 'enrollments'), where('courseID', '==', courseId), where('status', '==', 'active')),
    query(collection(db, 'enrollments'), where('course_id', '==', courseId), where('status', '==', 'active')),
  ];

  let enrollmentsSnapshot = null;
  for (const q of enrollmentQueries) {
    const snap = await getDocs(q);
    if (!snap.empty) {
      enrollmentsSnapshot = snap;
      break;
    }
  }

  if (!enrollmentsSnapshot) {
    const allEnrollments = await getDocs(collection(db, 'enrollments'));
    const matchingDocs = allEnrollments.docs.filter((d) => {
      const data = d.data();
      return data.courseId === courseId || data.courseID === courseId || data.course_id === courseId;
    });
    enrollmentsSnapshot = { docs: matchingDocs };
  }

  const studentIds = enrollmentsSnapshot.docs.map((d) => {
    const data = d.data();
    return data.studentId || data.studentID || data.student_id || data.studentUid || data.student_uid;
  }).filter(Boolean);

  const students = [];
  for (const sid of studentIds) {
    const userDoc = await getDoc(doc(db, 'users', sid));
    if (userDoc.exists()) students.push({ id: sid, ...userDoc.data() });
  }
  return students;
};

export const getAttendanceForCourse = async (courseId, date) => {
  const queryOptions = [
    { field: 'courseId', value: courseId },
    { field: 'courseID', value: courseId },
    { field: 'course_id', value: courseId }
  ];

  let snapshot = null;
  for (const option of queryOptions) {
    const q = query(collection(db, 'attendance'), where(option.field, '==', option.value), where('date', '==', date));
    const snap = await getDocs(q);
    if (!snap.empty) {
      snapshot = snap;
      break;
    }
  }

  if (!snapshot) {
    const allAttendance = await getDocs(collection(db, 'attendance'));
    const matchingDocs = allAttendance.docs.filter((d) => {
      const data = d.data();
      return (data.courseId === courseId || data.courseID === courseId || data.course_id === courseId)
        && data.date === date;
    });
    return matchingDocs.map(d => ({ id: d.id, ...d.data() }));
  }

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAvailableCourses = async () => {
  const q = query(collection(db, 'courses'), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};