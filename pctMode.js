var pctCatCount  = 0;

var pctRowCounts = {};


function addPctCat() {
  pctCatCount++;
  var id = pctCatCount;
  pctRowCounts[id] = 0;

  var div = document.createElement("div");
  div.className = "category";
  div.id = "pct-cat-" + id;

  div.innerHTML =
    "<div class='cat-top' onclick='toggleCat(" + id + ", \"pct\")'>" +
      "<span class='arrow open' id='pct-arrow-" + id + "'>▶</span>" +
      "<input class='cat-name' type='text' placeholder='Category (e.g. Homework)'" +
        " onclick='event.stopPropagation()' oninput='updatePctBar()' />" +
      "<div class='cat-weight-wrap'>" +
        "<input type='number' min='0' max='100' placeholder='0'" +
          " id='pct-w-" + id + "'" +
          " onclick='event.stopPropagation()'" +
          " oninput='updatePctBar(); calcPctFinal(); refreshPctPreview()' />" +
        "<span>%</span>" +
      "</div>" +
      "<button class='del-btn' onclick='event.stopPropagation(); delPctCat(" + id + ")'>×</button>" +
    "</div>" +
    "<div class='cat-body open' id='pct-body-" + id + "'>" +
      "<div class='row-hdr' style='grid-template-columns:1fr 100px 28px'>" +
        "<span>Assignment</span>" +
        "<span style='text-align:center'>Score %</span>" +
        "<span></span>" +
      "</div>" +
      "<div id='pct-rows-" + id + "'></div>" +
      "<button class='add-row-btn' onclick='addPctRow(" + id + ")'>+ Add Assignment</button>" +
      "<div class='your-score'>" +
        "<label>Your overall score in this category:</label>" +
        "<input type='number' min='0' max='100' placeholder='e.g. 88'" +
          " id='pct-s-" + id + "' oninput='refreshPctPreview(); calcPctFinal()' />" +
        "<span>%</span>" +
      "</div>" +
    "</div>";

  document.getElementById("pct-cat-list").appendChild(div);

  addPctRow(id);
  addPctRow(id);

  updatePctBar();
}

function delPctCat(id) {
  document.getElementById("pct-cat-" + id).remove();
  updatePctBar();
  refreshPctPreview();
}


function updatePctBar() {
  var inputs = document.querySelectorAll("[id^='pct-w-']");
  var total  = 0;

  for (var i = 0; i < inputs.length; i++) {
    var v = parseFloat(inputs[i].value);
    if (!isNaN(v)) {
      total += v;
    }
  }

  document.getElementById("pct-bar-fill").style.width = Math.min(total, 100) + "%";
  document.getElementById("pct-bar-fill").style.backgroundColor = total > 100 ? "#CC0000" : "#7B0000";
  document.getElementById("pct-bar-text").textContent = total.toFixed(0) + " / 100% used";
}


function addPctRow(catId) {
  pctRowCounts[catId]++;
  var rowNum    = pctRowCounts[catId];
  var container = document.getElementById("pct-rows-" + catId);

  var row = document.createElement("div");
  row.className = "asgn-row";
  row.style.gridTemplateColumns = "1fr 100px 28px";
  row.id = "pct-row-" + catId + "-" + rowNum;

  row.innerHTML =
    "<input type='text' placeholder='e.g. HW 1' />" +
    "<input type='number' min='0' max='100' placeholder='85'" +
      " oninput='autoAvg(" + catId + ")' style='text-align:center' />" +
    "<button class='del-btn'" +
      " onclick=\"document.getElementById('pct-row-" + catId + "-" + rowNum + "').remove();" +
      " autoAvg(" + catId + ")\">×</button>";

  container.appendChild(row);
}

function autoAvg(catId) {
  var rows   = document.getElementById("pct-rows-" + catId).querySelectorAll(".asgn-row");
  var scores = [];

  for (var i = 0; i < rows.length; i++) {
    var val = parseFloat(rows[i].querySelectorAll("input[type='number']")[0].value);
    if (!isNaN(val)) {
      scores.push(val);
    }
  }

  if (scores.length > 0) {
    var sum = 0;
    for (var i = 0; i < scores.length; i++) {
      sum += scores[i];
    }
    document.getElementById("pct-s-" + catId).value = (sum / scores.length).toFixed(1);
  }

  refreshPctPreview();
  calcPctFinal();
}


function collectPctData() {
  var cats        = document.querySelectorAll("[id^='pct-cat-']");
  var rows        = [];
  var totalW      = 0;
  var weightedSum = 0;
  var scoredW     = 0;
  var hasScore    = false;

  for (var i = 0; i < cats.length; i++) {
    var catId  = cats[i].id.replace("pct-cat-", "");
    var nameEl = cats[i].querySelector(".cat-name");
    var name   = (nameEl && nameEl.value) ? nameEl.value : "Category";

    var weightEl = document.getElementById("pct-w-" + catId);
    var scoreEl  = document.getElementById("pct-s-" + catId);

    var weight = parseFloat(weightEl ? weightEl.value : "");
    var score  = parseFloat(scoreEl  ? scoreEl.value  : "");

    if (!isNaN(weight) && weight > 0) {
      totalW += weight;

      if (!isNaN(score)) {
        weightedSum += (score * weight) / 100;
        scoredW     += weight;
        hasScore     = true;
        rows.push({
          name:   name,
          weight: weight,
          score:  score,
          contrib: ((score * weight) / 100).toFixed(2)
        });
      } else {
        rows.push({ name: name, weight: weight, score: null, contrib: null });
      }
    }
  }

  var pct = scoredW > 0 ? (weightedSum / scoredW) * 100 : null;

  return { pct: pct, rows: rows, totalW: totalW, weightedSum: weightedSum, scoredW: scoredW, hasScore: hasScore };
}

function refreshPctPreview() {
  var data = collectPctData();
  if (!data.hasScore) {
    document.getElementById("pct-preview").classList.remove("show");
    return;
  }

  showPreview("pct", data.pct, data.rows, null, null);
}


function calcPct() {
  hideErr("pct-error");

  var cats = document.querySelectorAll("[id^='pct-cat-']");

  if (cats.length === 0) {
    showErr("pct-error", "Please add at least one category.");
    return;
  }

  var data = collectPctData();

  if (!data.hasScore) {
    showErr("pct-error", "Enter your score in at least one category.");
    return;
  }

  if (data.totalW > 100.5) {
    showErr("pct-error",
      "Weights add up to " + data.totalW.toFixed(1) + "% — they should total 100% or less.");
    return;
  }

  showPreview("pct", data.pct, data.rows, null, null);
  calcPctFinal();
}

function calcPctFinal() {
  var finalW = parseFloat(document.getElementById("pct-final-w").value);
  var target = parseFloat(document.getElementById("pct-target").value);
  var box    = document.getElementById("pct-final-box");

  if (isNaN(finalW) || isNaN(target) || finalW <= 0) {
    box.classList.remove("show");
    return;
  }

  var data   = collectPctData();
  var totalW = data.scoredW + finalW;
  var needed = ((target * totalW / 100) - data.weightedSum) / (finalW / 100);

  box.innerHTML = buildFinalHTML(needed, data.weightedSum, finalW, totalW, false);
  box.classList.add("show");
}
