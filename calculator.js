// 사용방법

/**
 * 
 * 콘솔에서
 * DisplayValues(이자율, 대출금액)
 */




/*
- Function fcnAmountPerPeriod
-
- This function calculates the payment amount per period throughout a loan.
-
- Parameters:
- a_intInterestRate = The interest rate in decimal form.
- a_intCompoundingPeriods = The number of times interest is applied to the loan.
- a_intPrincipal = The initial amount of the loan.
- a_intTerms = The total amount of terms the loan is set for.
-
- Returns:
- intAmountPerPeriod = The amount per period.
*/
function fcnAmountPerPeriod(a_intInterestRate, a_intCompoundingPeriods, a_intPrincipal, a_intTerms) {
  //Declare all the variables used.
  var intAnnualInterestRate
  var intNominalInterestRate
  var intAmountPerPeriod
  var intTotalPeriods

  //Compute the Annual Interest Rate.
  intAnnualInterestRate = Math.pow((1 + a_intInterestRate / a_intCompoundingPeriods), a_intCompoundingPeriods) - 1;

  //Compute the Nominal Interest Rate.
  intNominalInterestRate = Math.pow((1 + intAnnualInterestRate), 1 / a_intCompoundingPeriods) - 1;

  //Compute the Amount Per Period.
  intAmountPerPeriod = a_intPrincipal * intNominalInterestRate * Math.pow((1 + intNominalInterestRate), a_intTerms) / (Math.pow((1 + intNominalInterestRate), a_intTerms) - 1);

  //Return the Monthly Payment.
  return (intAmountPerPeriod);
}

function DisplayRates() {
  if (ValidateMortgage()) {
    DisplayValues();
    ShowStep4();
    document['aspnetForm']['ctl00$cphMainContent$Calculated'].value = 1;
    document['aspnetForm']['ResetBaseline'].value = document['aspnetForm']['Baseline'].selectedIndex;
  }
  else {
    document['aspnetForm']['Baseline'].selectedIndex = document['aspnetForm']['ResetBaseline'].value;
  }
}

function DisplayRatesFirst() {
  if (ValidateMortgage()) {
      document['aspnetForm']['ctl00$cphMainContent$Calculated'].value = 1;
    this.form.submit();
  }
  else {
    document['aspnetForm']['Baseline'].selectedIndex = 0;
  }
}


function ShowStep4() {
  var isIE = document.all;
  var isIE6 = isIE && document.implementation;
  var isIE5 = isIE && window.print && !isIE6;
  var isIEDOM2 = isIE5 || isIE6;
  var isIE4 = isIE && !isIEDOM2 && navigator.cookieEnabled;
  var isIE4 = document.all && !(isIE5 || isIE6) && navigator.cookieEnabled;
  var isNS4 = document.layers;

  if (isIE4) {
    if (document.aspnetForm.MonthlyPmt5.value == "N/A (2)")
      document.all.savings.note2.display = "";
  }
  else if (isNS4) {

  }
  else {
    if (document.aspnetForm.MonthlyPmt5.value == "N/A (2)")
      document.getElementById("note2").style.display = "";
  }
}


// 최초 계산표
// var aryRates = new Array(7);
// aryRates[0] = 7.039; // 760-850
// aryRates[1] = 7.297; // 700-759
// aryRates[2] = 7.428; // 680-699
// aryRates[3] = 7.488; // 660-679
// aryRates[4] = 7.603; // 640-659
// aryRates[5] = 7.736; // 620-639
// aryRates[6] = 360;


/*
- Function DisplayValues()
-
- This function is called by the calculator to
- ** retrieve the Baseline Rate from memory
- ** calculate monthly payments for all FICO ranges
- ** calculate savings on monthly payments between baseline and other ranges
- ** calculate interest over life of loan for each FICO range
- ** calculate total amount saved over life of loan between baseline and other ranges
- ** display these calculations in the appropriate fields
*/
function DisplayValues(APRrate = 7, intCurrentLoan = 570000) {

  function calculateMortgageRates(apr) {
    const adjustmentFactors = [0.80, 0.85, 0.90, 0.925, 0.95, 1.00];
  
    const baseIncrements = [0.012, 0.270, 0.401, 0.461, 0.576, 0.709];
  
    var aryRates = new Array(6);
  
    for (let i = 0; i < aryRates.length; i++) {
        aryRates[i] = apr + (baseIncrements[i] * adjustmentFactors[i]);
    }
  
    return aryRates;
  }
  
  var aryRates = calculateMortgageRates(APRrate);
  aryRates[6] = 360;

  var intCRange = 1;
  var intTRange;

  console.log("총 대출 금액: $", intCurrentLoan.toLocaleString());
  console.log("설정한 30년 모기지 금리: ", APRrate.toLocaleString(), "%");


  // 신용 점수 범위를 매핑하는 배열
  var creditRanges = [
    "760-850",
    "700-759",
    "680-699",
    "660-679",
    "640-659",
    "620-639"
  ];

  // 결과를 저장할 배열
  var results = [];

  for (intTRange = 0; intTRange < 6; intTRange++) {
    var dblCRate = aryRates[intTRange];
    var dblTRate = aryRates[intTRange];
    var intPrinc = intCurrentLoan;
    var intMonths = aryRates[6];

    if (dblCRate > 0) { //rate available
      var intCPmt = fcnAmountPerPeriod(dblCRate / 100, 12, intPrinc, intMonths);
      var intInterestCurrent = (intCPmt * intMonths) - intPrinc;
    }
    
    var intTPmt = fcnAmountPerPeriod(dblTRate / 100, 12, intPrinc, intMonths);
    var monthly = "$" + formatCommas(Math.round(intTPmt), true, 2);
    var intInterestTarget = (intTPmt * intMonths) - intPrinc;
    var totalInterest = "$" + formatCommas(Math.round(intInterestTarget), true, 2);

    // 계산 결과를 배열에 저장
    results.push({
      "Credit Range": creditRanges[intTRange], // 신용 점수 범위를 매핑
      "Monthly Payment": monthly,
      "Total Interest": totalInterest
    });
  }

  // 콘솔에 테이블 형식으로 출력
  console.table(results);
}



// Function ValidateMortgage()
//
// This function is called every time the principal is changed, makes sure the principal is a numeric value
//
function ValidateMortgage() {
    mv = new String(document['aspnetForm']['ctl00_cphMainContent_txtLoanPrincipal'].value);
  var i = 0;

  //check to make sure the string isn't empty
  if (mv.length == 0) {
    alert("Please enter a valid Loan Principal.");
    return false;
  }

  //check for leading dollar sign ($)
  if (mv.charCodeAt(0) == 36)
    mv = mv.substr(1, mv.length - 1);

  //remove commas
  for (i = 0; i < mv.length; i++) {
    var intCode = mv.charCodeAt(i);
    if (intCode == 44) {
      if (i < mv.length - 1) {
        var temp1 = mv.substr(0, i);
        var temp2 = mv.substr(i + 1, mv.length - (i + 1));
        mv = temp1.concat(temp2);
        i--; //character has been removed, so next char is now in current position.
      }
      else //comma is at the end of the string
        mv = mv.substr(0, i);
    }
    else //make sure this char is a digit (charCodes 48-57)
    {
      if ((intCode < 48) || (intCode > 57)) {
        alert("Please enter a valid Loan Principal.");
        document['aspnetForm']['ctl00_cphMainContent_txtLoanPrincipal'].value = "";
        return false;
      }
    }
  }
  document['aspnetForm']['ctl00_cphMainContent_txtLoanPrincipal'].value = mv;
  return true;
}

//taken from http://www.tneoh.zoneit.com/javascript/js_func.html#formatDecimal 
function formatDecimal(argvalue, addzero, decimaln) {
  var numOfDecimal = (decimaln == null) ? 2 : decimaln;
  var number = 1;
  number = Math.pow(10, numOfDecimal);
  argvalue = Math.round(parseFloat(argvalue) * number) / number;
  argvalue = "" + argvalue;
  if (argvalue.indexOf(".") == 0)
    argvalue = "0" + argvalue;
  if (addzero == true) {
    if (argvalue.indexOf(".") == -1)
      argvalue = argvalue + ".";
    while ((argvalue.indexOf(".") + 1) > (argvalue.length - numOfDecimal))
      argvalue = argvalue + "0";
  }
  return argvalue;
}

function formatCommas(argvalue) {
  var strWholeNumPart = "" + argvalue;
  var strDecimalPart = "";
  var intDecimalLocation = strWholeNumPart.indexOf(".");
  var strSign = "";
  var i = 3;
  var temp1 = "";
  var temp2 = "";
  //if this is not a whole number, separate into parts, delimited by the decimal
  if (intDecimalLocation >= 0) {
    strDecimalPart = strWholeNumPart.substr(intDecimalLocation, (strWholeNumPart.length - intDecimalLocation));
    strWholeNumPart = strWholeNumPart.substr(0, intDecimalLocation);
  }
  //remove sign
  if ((strWholeNumPart.length > 0) && (strWholeNumPart.charAt(0) == '-')) {
    strSign = "-";
    strWholeNumPart = strWholeNumPart.substr(1, strWholeNumPart.length - 1);
  }
  //build new string with commas
  for (i = strWholeNumPart.length; i > 0; i -= 3) {
    if (i <= 3) {
      temp1 = strWholeNumPart.substr(0, i);
    }
    else {
      temp1 = "," + strWholeNumPart.substr(i - 3, 3);
    }
    temp2 = temp1 + temp2;
  }
  return strSign + temp2 + "" + strDecimalPart;
}
