var gradeScale = [
  { min: 97, letter: "A+", gpa: 4.333 },
  { min: 93, letter: "A",  gpa: 4.000 },
  { min: 90, letter: "A-", gpa: 3.667 },
  { min: 87, letter: "B+", gpa: 3.333 },
  { min: 83, letter: "B",  gpa: 3.000 },
  { min: 80, letter: "B-", gpa: 2.667 },
  { min: 77, letter: "C+", gpa: 2.333 },
  { min: 73, letter: "C",  gpa: 2.000 },
  { min: 70, letter: "C-", gpa: 1.667 },
  { min: 67, letter: "D+", gpa: 1.333 },
  { min: 63, letter: "D",  gpa: 1.000 },
  { min: 60, letter: "D-", gpa: 0.667 },
  { min: 0,  letter: "F",  gpa: 0.000 }
];

function getGrade(pct) {
  for (var i = 0; i < gradeScale.length; i++) {
    if (pct >= gradeScale[i].min) {
      return gradeScale[i];
    }
  }
  return gradeScale[gradeScale.length - 1];
}
