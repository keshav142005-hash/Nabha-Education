// 🔥 Firebase Config (replace with your own Firebase config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "XXXXXXXXX"
};

// ✅ Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ---------------- Teacher Functions ---------------- */
function saveAnnouncement() {
  let text = document.getElementById("noticeText").value;
  if (!text) return alert("Write something!");
  db.collection("announcements").add({
    message: text,
    timestamp: new Date()
  });
  alert("Announcement saved!");
  document.getElementById("noticeText").value = "";
}

function saveQuiz() {
  let quiz = {
    question: document.getElementById("qText").value,
    options: [
      document.getElementById("opt1").value,
      document.getElementById("opt2").value,
      document.getElementById("opt3").value,
      document.getElementById("opt4").value
    ],
    correct: document.getElementById("correct").value
  };
  if (!quiz.question) return alert("Enter question!");
  db.collection("quizzes").add(quiz);
  alert("Quiz saved!");
}

function saveAssignment() {
  let assignment = {
    title: document.getElementById("assignTitle").value,
    desc: document.getElementById("assignDesc").value,
    deadline: document.getElementById("assignDeadline").value
  };
  if (!assignment.title) return alert("Enter assignment title!");
  db.collection("assignments").add(assignment);
  alert("Assignment saved!");
}

/* ---------------- Student Functions ---------------- */
function loadAnnouncements() {
  db.collection("announcements").orderBy("timestamp","desc").onSnapshot(snapshot => {
    let list = document.getElementById("announcementsList");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      list.innerHTML += `<div class="card">📢 ${doc.data().message}</div>`;
    });
  });
}

function loadQuizzes() {
  db.collection("quizzes").onSnapshot(snapshot => {
    let container = document.getElementById("quizList");
    container.innerHTML = "";
    snapshot.forEach((doc, idx) => {
      let q = doc.data();
      container.innerHTML += `
        <div class="card">
          <b>Q${idx+1}: ${q.question}</b><br>
          ${q.options.map((opt, i) => 
            `<label><input type="radio" name="quiz${idx}" value="${i}" class="quiz-option"> ${opt}</label>`
          ).join("<br>")}
          <button onclick="submitQuiz('${doc.id}', ${idx})">Submit</button>
          <div id="quizResult${idx}"></div>
        </div>
      `;
    });
  });
}

function submitQuiz(id, idx) {
  let selected = document.querySelector(`input[name="quiz${idx}"]:checked`);
  if (!selected) return alert("Please select an answer!");
  db.collection("quizzes").doc(id).get().then(doc => {
    let quiz = doc.data();
    let resultBox = document.getElementById("quizResult"+idx);
    if (selected.value == quiz.correct) {
      resultBox.innerHTML = "✅ Correct!";
    } else {
      resultBox.innerHTML = "❌ Wrong! Correct answer: " + quiz.options[quiz.correct];
    }
  });
}

function loadAssignments() {
  db.collection("assignments").onSnapshot(snapshot => {
    let container = document.getElementById("assignmentList");
    container.innerHTML = "";
    snapshot.forEach((doc, idx) => {
      let a = doc.data();
      container.innerHTML += `
        <div class="card">
          <b>${a.title}</b><br>
          ${a.desc}<br>
          Deadline: ${a.deadline}<br>
          <textarea id="submit${idx}" placeholder="Write your answer..."></textarea>
          <button onclick="submitAssignment('${doc.id}', ${idx})">Submit</button>
          <div id="assignResult${idx}"></div>
        </div>
      `;
    });
  });
}

function submitAssignment(id, idx) {
  let answer = document.getElementById("submit"+idx).value;
  if (!answer) return alert("Please write your answer!");
  db.collection("assignments").doc(id).collection("submissions").add({
    student: "Student1",
    answer: answer,
    submittedAt: new Date()
  });
  document.getElementById("assignResult"+idx).innerHTML = "✅ Assignment Submitted!";
}
