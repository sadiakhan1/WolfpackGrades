var ptsCatCount  = 0;
var ptsRowCounts = {};

function addPtsCat() {
  ptsCatCount++;
  var id = ptsCatCount;
  ptsRowCounts[id] = 0;

  var div = document.createElement("div");
  div.className = "category";
  div.id = "pts-cat-" + id;

  div.innerHTML =
    "<div class='cat-top' onclick='toggleCat(" + id + ", \"pts\")'>" +
      "<span class='arrow open' id='pts-arrow-" + id + "'>▶</span>" +
      "<input class='cat-name' type='text' placeholder='Category (e.g. Quizzes)'" +
        " onclick='event.stopPropagation()' />" +
      "<button class='del-btn'" +
        " onclick='event.stopPropagation(); delPtsCat(" + id + ")'>×</button>" +
    "</div>" +
    "<div class='cat-body open' id='pts-body-" + id + "'>" +
      "<div class='row-hdr' style='grid-template-columns:1fr 90px 90px 28px'>" +
        "<span>Assignment</span>" +
        "<span style='text-align:center'>Earned</span>" +
        "<span style='text-align:center'>Total</span>" +
        "<span></span>" +
      "</div>" +
      "<div id='pts-rows-" + id + "'></div>" +
      "<button class='add-row-btn' onclick='addPtsRow(" + id + ")'>+ Add Assignment</button>" +
    "</div>";

  document.getElementById("pts-cat-list").appendChild(div);

  addPtsRow(id);
  addPtsRow(id);
}

function delPtsCat(id) {
  document.getElementById("pts-cat-" + id).remove();
  updatePtsRunning();
  refreshPtsPreview();
}

function addPtsRow(catId) {
  ptsRowCounts[catId]++;
  var rowNum    = ptsRowCounts[catId];
  var container = document.getElementById("pts-rows-" + catId);

  var row = document.createElement("div");
  row.className = "asgn-row";
  row.style.gridTemplateColumns = "1fr 90px 90px 28px";
  row.id = "pts-row-" + catId + "-" + rowNum;

  row.innerHTML =
    "<input type='text' placeholder='e.g. Quiz 1' />" +
    "<input type='number' min='0' placeholder='45'" +
      " oninput='updatePtsRunning(); refreshPtsPreview(); calcPtsFinal()'" +
      " style='text-align:center' />" +
    "<input type='number' min='0' placeholder='50'" +
      " oninput='updatePtsRunning(); refreshPtsPreview(); calcPtsFinal()'" +
      " style='text-align:center' />" +
    "<button class='del-btn'" +
      " onclick=\"document.getElementById('pts-row-" + catId + "-" + rowNum + "').remove();" +
      " updatePtsRunning(); refreshPtsPreview(); calcPtsFinal()\">×</button>";

  container.appendChild(row);
}


function updatePtsRunning() {
  var data = collectPtsData();
  var bar  = document.getElementById("pts-running");

  if (data.totalPts > 0) {
    var pct = (data.totalEarned / data.totalPts * 100).toFixed(1);
    bar.innerHTML =
      "Running: <strong>" + data.totalEarned + " / " + data.totalPts + " pts</strong>" +
      " &nbsp;·&nbsp; <strong>" + pct + "%</strong>";
    bar.style.display = "block";
  } else {
    bar.style.display = "none";
  }
}


function collectPtsData() {
  var cats        = document.querySelectorAll("[id^='pts-cat-']");
  var rows        = [];
  var totalEarned = 0;
  var totalPts    = 0;

  for (var i = 0; i < cats.length; i++) {
    var catId   = cats[i].id.replace("pts-cat-", "");
    var catName = (cats[i].querySelector(".cat-name") && cats[i].querySelector(".cat-name").value)
                  ? cats[i].querySelector(".cat-name").value
                  : "Category";

    var asgns = document.getElementById("pts-rows-" + catId).querySelectorAll(".asgn-row");

    for (var j = 0; j < asgns.length; j++) {
      var nums    = asgns[j].querySelectorAll("input[type='number']");
      var asgName = (asgns[j].querySelector("input[type='text']") &&
                     asgns[j].querySelector("input[type='text']").value)
                    ? asgns[j].querySelector("input[type='text']").value
                    : "Assignment";

      var earned = parseFloat(nums[0] ? nums[0].value : "");
      var total  = parseFloat(nums[1] ? nums[1].value : "");

      if (!isNaN(earned) && !isNaN(total) && total > 0) {
        totalEarned += earned;
        totalPts    += total;
        rows.push({ name: catName + " · " + asgName, earned: earned, total: total });
      }
    }
  }

  var pct = totalPts > 0 ? (totalEarned / totalPts) * 100 : null;
  return { pct: pct, rows: rows, totalEarned: totalEarned, totalPts: totalPts };
}



function refreshPtsPreview() {
  var data = collectPtsData();

  if (data.totalPts === 0) {
    document.getElementById("pts-preview").classList.remove("show");
    return;
  }

  showPreview("pts", data.pct, data.rows, data.totalEarned, data.totalPts);
}

function calcPts() {
  hideErr("pts-error");

  var cats = document.querySelectorAll("[id^='pts-cat-']");

  if (cats.length === 0) {
    showErr("pts-error", "Please add at least one category.");
    return;
  }

  var data = collectPtsData();

  if (data.totalPts === 0) {
    showErr("pts-error", "Enter at least one assignment with earned and total points.");
    return;
  }

  showPreview("pts", data.pct, data.rows, data.totalEarned, data.totalPts);
  calcPtsFinal();
}


function calcPtsFinal() {
  var finalPts = parseFloat(document.getElementById("pts-final-pts").value);
  var target   = parseFloat(document.getElementById("pts-target").value);
  var box      = document.getElementById("pts-final-box");

  if (isNaN(finalPts) || isNaN(target) || finalPts <= 0) {
    box.classList.remove("show");
    return;
  }

  var data       = collectPtsData();
  var grandTotal = data.totalPts + finalPts;

  var neededPts = (target / 100) * grandTotal - data.totalEarned;
  var neededPct = (neededPts / finalPts) * 100;

  box.innerHTML = buildFinalHTML(neededPct, data.totalEarned, finalPts, grandTotal, true);
  box.classList.add("show");
}
