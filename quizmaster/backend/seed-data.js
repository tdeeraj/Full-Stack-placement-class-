// ============================================================
//  seed-data.js — Default data for the Node.js backend
//  QuizMaster Pro
// ============================================================

const quizzes = [
  {
    id: 1, title: "JavaScript Fundamentals", category: "Programming",
    duration: 20, passingScore: 70, published: true, createdAt: "2024-01-15",
    questions: [
      { id:1, text:"What is the output of typeof null?",                     options:["null","object","undefined","string"],                      correct:1, points:20 },
      { id:2, text:"Which method removes the last element from an array?",   options:["shift()","pop()","splice()","slice()"],                    correct:1, points:20 },
      { id:3, text:"What does === check?",                                   options:["Value only","Type only","Value and type","Neither"],       correct:2, points:20 },
      { id:4, text:"Which is NOT a JavaScript primitive type?",              options:["Boolean","Float","String","Symbol"],                       correct:1, points:20 },
      { id:5, text:"What does 'use strict' enable?",                         options:["Strict mode","Error suppression","Faster execution","None"],correct:0, points:20 },
    ],
  },
  {
    id: 2, title: "React & Modern Frontend", category: "Programming",
    duration: 25, passingScore: 65, published: true, createdAt: "2024-02-10",
    questions: [
      { id:1, text:"Which hook manages local component state?",              options:["useEffect","useState","useContext","useRef"],               correct:1, points:25 },
      { id:2, text:"What does JSX stand for?",                               options:["JavaScript XML","Java Syntax Extension","JSON XML","JavaScript Extra"], correct:0, points:25 },
      { id:3, text:"useEffect with [] dependency array runs:",               options:["Every render","Once on mount","On unmount","Never"],        correct:1, points:25 },
      { id:4, text:"How do you pass data to a child component?",             options:["state","props","context","refs"],                          correct:1, points:25 },
    ],
  },
  {
    id: 3, title: "Node.js & Backend", category: "Backend",
    duration: 20, passingScore: 70, published: true, createdAt: "2024-03-01",
    questions: [
      { id:1, text:"What is Node.js built on?",                              options:["SpiderMonkey","V8 Engine","Chakra","JavaScriptCore"],       correct:1, points:25 },
      { id:2, text:"Which module handles HTTP in Node.js?",                  options:["fs","path","http","net"],                                  correct:2, points:25 },
      { id:3, text:"npm stands for:",                                        options:["Node Package Manager","New Project Manager","Node Program Module","None"], correct:0, points:25 },
      { id:4, text:"Express.js is a:",                                       options:["Database","Frontend framework","Web framework for Node","Testing library"], correct:2, points:25 },
    ],
  },
];

const results = [
  { id:1, quizId:1, quizTitle:"JavaScript Fundamentals", userName:"Alice Johnson", email:"alice@demo.com", score:90,  passed:true,  date:"2024-03-10", timeTaken:18, answers:{0:1,1:1,2:2,3:1,4:0} },
  { id:2, quizId:1, quizTitle:"JavaScript Fundamentals", userName:"Bob Smith",     email:"bob@demo.com",   score:60,  passed:false, date:"2024-03-11", timeTaken:22, answers:{0:0,1:1,2:2,3:0,4:1} },
  { id:3, quizId:2, quizTitle:"React & Modern Frontend", userName:"Carol White",   email:"carol@demo.com", score:75,  passed:true,  date:"2024-03-12", timeTaken:20, answers:{0:1,1:0,2:1,3:1} },
  { id:4, quizId:1, quizTitle:"JavaScript Fundamentals", userName:"David Lee",     email:"david@demo.com", score:100, passed:true,  date:"2024-03-13", timeTaken:15, answers:{0:1,1:1,2:2,3:1,4:0} },
];

module.exports = { quizzes, results };
