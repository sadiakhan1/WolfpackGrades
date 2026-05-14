
function showTab(tabName, clickedBtn) {
  document.getElementById("page-pct").classList.remove("active");
  document.getElementById("page-pts").classList.remove("active");

  var allBtns = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < allBtns.length; i++) {
    allBtns[i].classList.remove("active");
  }

  document.getElementById("page-" + tabName).classList.add("active");
  clickedBtn.classList.add("active");
}

function showErr(id, msg) {
  var el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = "block";
}

function hideErr(id) {
  document.getElementById(id).style.display = "none";
}



function toggleCat(id, mode) {
  var body  = document.getElementById(mode + "-body-"  + id);
  var arrow = document.getElementById(mode + "-arrow-" + id);

  if (body.classList.contains("open")) {
    body.classList.remove("open");
    arrow.classList.remove("open");
  } else {
    body.classList.add("open");
    arrow.classList.add("open");
  }
}


function showPreview(mode, pct, breakdownRows, totalEarned, totalPts) {
  var info = getGrade(pct); 

  document.getElementById(mode + "-prev-pct").innerHTML     = pct.toFixed(2) + "<span>%</span>";
  document.getElementById(mode + "-prev-letter").textContent = info.letter;

  var gpaExtra = totalPts
    ? "<span>" + totalEarned + " / " + totalPts + " pts</span>"
    : "";
  document.getElementById(mode + "-prev-gpa").innerHTML =
    "<span>GPA points: <strong>" + info.gpa.toFixed(3) + "</strong></span>" + gpaExtra;

  var html = "";

  if (mode === "pct") {
    html += "<div class='cat-breakdown-row hdr' style='grid-template-columns:1fr 70px 80px 80px'>" +
              "<span>Category</span>" +
              "<span>Weight</span>" +
              "<span>Your score</span>" +
              "<span>Contribution</span>" +
            "</div>";

    for (var i = 0; i < breakdownRows.length; i++) {
      var r = breakdownRows[i];
      html += "<div class='cat-breakdown-row' style='grid-template-columns:1fr 70px 80px 80px'>" +
                "<span>" + r.name + "</span>" +
                "<span>" + r.weight + "%</span>" +
                "<span>" + (r.score !== null ? r.score + "%" : "—") + "</span>" +
                "<span class='contrib'>" + (r.score !== null ? r.contrib + "%" : "—") + "</span>" +
              "</div>";
    }

  } else {
    html += "<div class='cat-breakdown-row hdr' style='grid-template-columns:1fr 80px 80px 70px'>" +
              "<span>Assignment</span>" +
              "<span>Earned</span>" +
              "<span>Total</span>" +
              "<span>%</span>" +
            "</div>";

    for (var i = 0; i < breakdownRows.length; i++) {
      var r = breakdownRows[i];
      html += "<div class='cat-breakdown-row' style='grid-template-columns:1fr 80px 80px 70px'>" +
                "<span>" + r.name + "</span>" +
                "<span>" + r.earned + "</span>" +
                "<span>" + r.total  + "</span>" +
                "<span class='contrib'>" + (r.earned / r.total * 100).toFixed(1) + "%</span>" +
              "</div>";
    }
  }

  document.getElementById(mode + "-prev-table").innerHTML = html;

  document.getElementById(mode + "-preview").classList.add("show");
}

function buildFinalHTML(needed, curWeighted, finalW, totalW, isPoints) {
  var txt, cls;
  if (needed < 0)        { txt = "Already there! ✓";     cls = "easy"; }
  else if (needed > 100) { txt = "> 100% (not possible)"; cls = "cant"; }
  else if (needed <= 75) { txt = needed.toFixed(1) + "%"; cls = "easy"; }
  else                   { txt = needed.toFixed(1) + "%"; cls = "hard"; }

  var targets = [
    { label: "A+ (97%)", min: 97 },
    { label: "A  (93%)", min: 93 },
    { label: "A- (90%)", min: 90 },
    { label: "B+ (87%)", min: 87 },
    { label: "B  (83%)", min: 83 },
    { label: "B- (80%)", min: 80 },
    { label: "C  (73%)", min: 73 }
  ];

  var rows = "";
  for (var i = 0; i < targets.length; i++) {
    var t = targets[i];
    var n;

    if (isPoints) {
      n = ((t.min / 100) * totalW - curWeighted) / finalW * 100;
    } else {
      n = ((t.min * totalW / 100) - curWeighted) / (finalW / 100);
    }

    var c, v;
    if (n < 0)        { c = "score-easy"; v = "Already set ✓"; }
    else if (n > 100) { c = "score-cant"; v = "Not possible";   }
    else if (n <= 75) { c = "score-easy"; v = n.toFixed(1) + "%"; }
    else              { c = "score-hard"; v = n.toFixed(1) + "%"; }

    rows += "<div class='other-grade-row'>" +
              "<span>" + t.label + "</span>" +
              "<span class='" + c + "'>" + v + "</span>" +
            "</div>";
  }

  return "<h3>Score needed on the final</h3>" +
         "<div class='needed-big " + cls + "'>" + txt + "</div>" +
         "<div class='other-grades'>" + rows + "</div>";
}
