import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  TextField,
  Button,
  Alert,
  IconButton,
  Collapse
} from "@mui/material";

import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";

import { ExpandMore, ExpandLess } from "@mui/icons-material";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc
} from "firebase/firestore";
import InvestorLogin from "../pages/InvestorLogin";
import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../services/firebase";

// THEME
const GOLD = "#F4B400";
const BG = "#000000";
const CARD = "#000000";
const TEXT = "#fff";
const SUB = "#aaa";
const BAR = "#ebdc0c";
const TAR = "#14f400";

export default function InvestorDashboard() {

  const [stats, setStats] = useState({
    target: 500000,
    total: 0,
    investors: 0
  });

  const [showRevenue, setShowRevenue] = useState(false);

  const [plan, setPlan] = useState({
  type: "daily",
  amount: "",
  startDate: "",
  endDate: "",
  oneTimeDate: "",
  target: ""
});

  const [isNewInvestor, setIsNewInvestor] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [myTotal, setMyTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [openSignupModal, setOpenSignupModal] = useState(false);
  const [showPledge, setShowPledge] = useState(false);
  const [hasPledge, setHasPledge] = useState(false);

const [pledge, setPledge] = useState({
  name: "",
  amount: "",
  startAmount: ""
});

  const [form, setForm] = useState({
    name: "",
    amount: ""
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


  // 🔥 LIVE INVESTOR COUNT (independent of admin)
useEffect(() => {

  const unsub = onSnapshot(collection(db, "investors"), (snapshot) => {
    setStats(prev => ({
      ...prev,
      investors: snapshot.size
    }));
  });

  return () => unsub();

}, []);

// 🔥 COUNTDOWN TIMER
useEffect(() => {
  const deadline = new Date("2026-09-01T00:00:00");

  const interval = setInterval(() => {
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) {
      setTimeLeft("Deadline reached");
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    setTimeLeft(`${days}d ${hours}h ${minutes}m`);
  }, 1000);

  return () => clearInterval(interval);
}, []);

  // =========================
  // 🔥 GLOBAL STATS (FAST)
  // =========================
  useEffect(() => {

    const ref = doc(db, "investmentStats", "main");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setStats(prev => ({
  ...prev,
  target: data.target || 500000,
  total: data.totalRaised || 0
}));
      }
    });

    return () => unsub();

  }, []);

  // =========================
  // 🔥 CHECK PLEDGE
  // =========================
  useEffect(() => {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  const fetchPledge = async () => {
    try {
      const ref = doc(db, "pledges", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setPledge({
          name: data.name || "",
          amount: data.amount || ""
        });

        setHasPledge(true);
        setShowPledge(false); // ✅ already has → keep closed
      } else {
        setHasPledge(false);
        setShowPledge(true); // 🔥 first time → open automatically
      }

    } catch (err) {
      console.error(err);
    }
  };

  fetchPledge();

}, []);

  // =========================
  // 🔥 USER DATA + HISTORY
  // =========================
  useEffect(() => {

  let unsubInvestor = null;
  let unsubHistory = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {

    // 🔥 USER NOT LOGGED IN
    if (!user) {
      setLoadingUser(false);
      setIsNewInvestor(true);
      return;
    }

    const uid = user.uid;

    // ================= INVESTOR =================

    const investorRef = doc(db, "investors", uid);

    unsubInvestor = onSnapshot(investorRef, (snap) => {

      if (snap.exists()) {

        const data = snap.data();

        setIsNewInvestor(false);

        setMyTotal(data.totalInvested || 0);

        setForm((prev) => ({
          ...prev,
          name: data.name || ""
        }));

      } else {

        setIsNewInvestor(true);

      }

      setLoadingUser(false);

    });

    // ================= HISTORY =================

    const q = query(
      collection(db, "investments"),
      where("userId", "==", uid)
    );

    unsubHistory = onSnapshot(q, (snapshot) => {

      const list = [];
      let total = 0;

      snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          ...data
        });

        if (data.status === "approved") {
          total += data.amount;
        }

      });

      setHistory(list);
      setMyTotal(total);

    });

  });

  return () => {

    unsubscribeAuth();

    if (unsubInvestor) unsubInvestor();

    if (unsubHistory) unsubHistory();

  };

}, []);
  // =========================
  // CALCULATIONS
  // =========================
  const percentage = Math.min(
    (stats.total / stats.target) * 100,
    100
  );

  const deficit = stats.target - stats.total;
const remainingPercent = 100 - percentage;


  const average =
    stats.investors > 0
      ? Math.floor(stats.total / stats.investors)
      : 0;

      const myShare =
  stats.total > 0
    ? ((myTotal / stats.total) * 100).toFixed(2)
    : 0;

  // =========================
  // 🔥 SUBMIT CONTRIBUTION
  // =========================
  const handleSubmit = async () => {

  if (!auth.currentUser) {
    setError("Please login first");
    return;
  }

  if (!form.amount) {
    setError("Enter amount");
    return;
  }

  if (isNewInvestor && !form.name) {
    setError("Enter full name");
    return;
  }

  try {

    const uid = auth.currentUser.uid;

    const investorRef = doc(db, "investors", uid);

    let investorName = form.name;

    // 🔥 If existing investor, get stored name
    if (!isNewInvestor) {
      const snap = await getDoc(investorRef);
      investorName = snap.data()?.name;
    }

// 1️⃣ Save investment
await addDoc(collection(db, "investments"), {
  userId: uid,
  name: investorName,
  amount: Number(form.amount),
  status: "approved",
  createdAt: serverTimestamp(),
  approvedAt: serverTimestamp()
});

// 2️⃣ Update investor
if (isNewInvestor) {
  await setDoc(investorRef, {
    userId: uid,
    name: investorName,
    totalInvested: Number(form.amount),
    contributionsCount: 1,
    lastContributionAt: serverTimestamp(),
    status: "active"
  });
} else {
  await updateDoc(investorRef, {
    totalInvested: increment(Number(form.amount)),
    contributionsCount: increment(1),
    lastContributionAt: serverTimestamp()
  });
}

const statsRef = doc(db, "investmentStats", "main");

const statsSnap = await getDoc(statsRef);

if (!statsSnap.exists()) {
  // 🔥 First time create properly
  await setDoc(statsRef, {
    totalRaised: Number(form.amount),
    investorsCount: isNewInvestor ? 1 : 0,
    target: 500000,
    lastUpdated: serverTimestamp()
  });
} else {
  // 🔥 Safe increment
  await updateDoc(statsRef, {
    totalRaised: increment(Number(form.amount)),
    investorsCount: increment(isNewInvestor ? 1 : 0),
    lastUpdated: serverTimestamp()
  });
}

    setSuccess("Submitted Successfully - Thank you!");

    setForm({
      name: investorName, // keep name
      amount: ""
    });

  } catch (err) {
    console.error(err);
    setError("Failed to submit");
  }

};

// =========================
// 🔥 SAVE PLEDGE
// =========================

const handleSavePledge = async () => {
  if (!auth.currentUser) {
    setError("Login first");
    return;
  }

  if ( !pledge.amount ) {
    setError("Enter pledge amount");
    return;
  }

  try {
    const uid = auth.currentUser.uid;

    await setDoc(doc(db, "pledges", uid), {
      userId: uid,
      pledgeAmount: Number(pledge.amount),
      deadline: "2026-09-15",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

     setHasPledge(true);

    // 🔥 AUTO CLOSE AFTER SAVE
    setShowPledge(false);

    setSuccess("Pledge saved successfully");

  } catch (err) {
    console.error(err);
    setError("Failed to save pledge");
  }
};
//saveplan

const handleSavePlan = async () => {

  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  try {

    let expectedTotal = 0;

    if (plan.type === "daily") {
      const days = 150; // simple for now
      expectedTotal = plan.amount * days;
    }

    if (plan.type === "weekly") {
      const weeks = 20;
      expectedTotal = plan.amount * weeks;
    }

    if (plan.type === "monthly") {
      const months = 5;
      expectedTotal = plan.amount * months;
    }

    if (plan.type === "one_time") {
      expectedTotal = Number(plan.amount);
    }

    await setDoc(doc(db, "investmentPlans", uid), {
      userId: uid,
      planType: plan.type,
      amountPerCycle: Number(plan.amount),
      startDate: plan.startDate || null,
      endDate: plan.endDate || null,
      oneTimeDate: plan.oneTimeDate || null,
      targetAmount: Number(plan.target) || 0,
      expectedTotal,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setSuccess("Plan saved successfully");

  } catch (err) {
    console.error(err);
    setError("Failed to save plan");
  }

};

  // =========================
  // UI
  // =========================
  if (loadingUser) {
  return (
    <Box sx={{ background: BG, minHeight: "100vh" }}>
      <Typography sx={{ color: TEXT, p: 3 }}>
        Loading...
      </Typography>
    </Box>
  );
}

  return (

    <Box sx={{ background: BG, minHeight: "100vh", pb: 4 }}>

      <Container maxWidth="sm">

        <Paper sx={{ p: 2, mb: 2, background: CARD }}>
  
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography sx={{ color: TEXT }}>
      Don't have an account?
    </Typography>

    <IconButton
      onClick={() => setShowSignup(!showSignup)}
      sx={{ color: GOLD }}
    >
      {showSignup ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  </Box>

  <Collapse in={showSignup}>
    <Box mt={2}>
      <Typography sx={{ color: SUB, fontSize: 13 }}>
        Create an account to track your investments, history, and plans.
      </Typography>

      <Button
        fullWidth
        onClick={() => setOpenSignupModal(true)}
        sx={{
          mt: 2,
          background: GOLD,
          color: "#000",
          fontWeight: "bold"
        }}
      >
        Create Account
      </Button>
    </Box>
  </Collapse>

</Paper>

        <Typography sx={{ color: GOLD, py: 3, fontWeight: "bold" }}>
          Investor Dashboard
        </Typography>

        {/* TOTAL */}
        <Paper sx={{ p: 2, mb: 2, background: CARD }}>
          <Typography color={SUB}>Total Invested</Typography>

          <Typography sx={{ color: TEXT, fontSize: 26 }}>
            Ksh {stats.total.toLocaleString()}
          </Typography>

          <Typography color={TAR}>
            {percentage.toFixed(1)}%
          </Typography>

          <Typography sx={{ color: BAR, fontSize: 13, mt: 1 }}>
  Deadline: {timeLeft}
</Typography>

          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              mt: 1,
              height: 8,
              borderRadius: 5,
              "& .MuiLinearProgress-bar": {
                backgroundColor: GOLD
              }
            }}
          />
        </Paper>

        {/* DEFICIT */}
       <Paper sx={{ p: 2, mb: 2, background: CARD }}>
  <Typography color={SUB}>Remaining</Typography>

  <Typography sx={{ color: "#e91515", fontSize: 20 }}>
    Ksh {deficit.toLocaleString()}
  </Typography>

  {/* 🔥 NEW */}
  <Typography sx={{ color: SUB, fontSize: 12 }}>
    {remainingPercent.toFixed(1)}% remaining
  </Typography>

  <LinearProgress
    variant="determinate"
    value={remainingPercent}
    sx={{
      mt: 1,
      height: 6,
      borderRadius: 5,
      "& .MuiLinearProgress-bar": {
        backgroundColor: "#f31212",
        color: "#9eff1f",
      }
    }}
  />
</Paper>

        {/* USER TOTAL */}
        <Paper sx={{ p: 2, mb: 2, background: CARD }}>
          
          <Box display="flex" justifyContent="space-between">
            <Typography color={SUB}>
              Your Total Investment
            </Typography>

            <IconButton
              onClick={() => setShowHistory(!showHistory)}
              sx={{ color: GOLD }}
            >
              {showHistory ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Typography sx={{ color: GOLD, fontSize: 20 }}>
            Ksh {myTotal.toLocaleString()}
          </Typography>
          <Typography sx={{ color: TAR, fontSize: 13 }}>
  Your Stake: {myShare}%
</Typography>

          {/* 🔥 HISTORY */}
          <Collapse in={showHistory}>
            <Box mt={2}>
              {history.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    borderBottom: "1px solid #222",
                    py: 0.5
                  }}
                >
                  <span style={{ color: TEXT }}>
                    Ksh {item.amount}
                  </span>

                  <span
                    style={{
                      color:
                        item.status === "approved"
                          ? "#2e7d32"
                          : item.status === "pending"
                          ? "#ff9800"
                          : "#d32f2f"
                    }}
                  >
                    {item.status}
                  </span>
                </Box>
              ))}
            </Box>
          </Collapse>

        </Paper>

        {/* GRID */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, background: CARD }}>
              <Typography color={SUB}>Investors</Typography>
              <Typography sx={{ color: TEXT }}>
                {stats.investors}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper sx={{ p: 2, background: CARD }}>
              <Typography color={SUB}>Average</Typography>
              <Typography sx={{ color: TEXT }}>
                Ksh {average}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

{/* =========================  
🔥 INVESTOR PLEDGE SECTION  
========================= */}
<Paper sx={{ p: 2, mt: 3, background: CARD }}>

  {/* HEADER */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography sx={{ color: GOLD, fontWeight: "bold" }}>
      Investor Pledge
    </Typography>

    <IconButton
      onClick={() => setShowPledge(!showPledge)}
      sx={{ color: GOLD }}
    >
      {showPledge ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  </Box>

  {/* COLLAPSIBLE */}
  <Collapse in={showPledge}>
    <Box mt={2}>

      {/* EXPLANATION */}
      <Typography sx={{ color: SUB, fontSize: 19, mb: 2 }}>
        A pledge is your personal commitment to this vision.  
        It helps you stay disciplined and focused as an investor.
        <br /><br />
        Set how much you aim to contribute before <b> 30th Agust 2026</b>.
      </Typography>


      {/* PLEDGE AMOUNT */}
      <TextField
        fullWidth
        label="Your Total Pledge (KES)"
        type="number"
        value={pledge.amount}
        onChange={(e) =>
          setPledge({ ...pledge, amount: e.target.value })
        }
        sx={{ mb: 2 }}
      />

      <Typography sx={{ color: SUB, fontSize: 19, mb: 2 }}>
        🔹 Write your Full Names Below
      </Typography>

      {/* ACTIVATION */}
      <Typography sx={{ color: SUB, fontSize: 19, mb: 2 }}>
        🔹 Indicate your first activation amount: Minimum KES 100   
      </Typography>
      <Typography sx={{ color: SUB, fontSize: 19, mb: 2 }}>
        🔹 Submit Investment to register as Investor
      </Typography>


      

      {/* BUTTON */}
      <Button
        fullWidth
        onClick={handleSavePledge}
        sx={{
          background: GOLD,
          color: "#000",
          fontWeight: "bold"
        }}
      >
        Save / Update Pledge
      </Button>

    </Box>
  </Collapse>

</Paper>
        {/* FORM */}
      
        <Paper sx={{ p: 2, mt: 3, background: CARD }}>

  <Typography sx={{ color: GOLD, mb: 1 }}>
    Submit Investment
  </Typography>

  {error && <Alert severity="error">{error}</Alert>}
  {success && <Alert severity="success">{success}</Alert>}

  {/* 🔥 SHOW NAME ONLY FIRST TIME */}
  {isNewInvestor && (
    <TextField
      fullWidth
      label="Full Name"
      value={form.name}
      onChange={(e) =>
        setForm({ ...form, name: e.target.value })
      }
      sx={{ mt: 1 }}
    />
  )}

  {!isNewInvestor && (
    <><Typography sx={{ color: SUB, mt: 1 }}>
              Investor: <span style={{ color: GOLD }}>{form.name}</span>
            </Typography><Typography sx={{ color: SUB, fontSize: 12 }}>
                Mpesa Lipa na Mpesa Buy Goods & Services Till 3141192 confirm then enter amount and submit here
              </Typography></>
  )}

  <TextField
    fullWidth
    label="Amount (KES)"
    type="number"
    value={form.amount}
    onChange={(e) =>
      setForm({ ...form, amount: e.target.value })
    }
    sx={{ mt: 2 }}
  />

  <Button
    fullWidth
    onClick={handleSubmit}
    sx={{
      mt: 2,
      background: GOLD,
      color: "#000",
      fontWeight: "bold",
      height: 45
    }}
  >
    Submit
  </Button>

</Paper>

<Paper sx={{ p: 2, mt: 3, background: CARD }}>

  <Typography sx={{ color: GOLD, mb: 2 }}>
    Investment Plan (Required)
  </Typography>

  {/* PLAN TYPE */}
  <TextField
    select
    fullWidth
    label="Contribution Type"
    value={plan.type}
    onChange={(e) =>
      setPlan({ ...plan, type: e.target.value })
    }
    sx={{ mb: 2 }}
    SelectProps={{ native: true }}
  >
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
    <option value="one_time">One Time</option>
  </TextField>

  {/* AMOUNT */}
  <TextField
    fullWidth
    label="Amount (KES)"
    type="number"
    value={plan.amount}
    onChange={(e) =>
      setPlan({ ...plan, amount: e.target.value })
    }
    sx={{ mb: 2 }}
  />

  {/* DATES */}
  {plan.type !== "one_time" && (
    <>
      <TextField
        fullWidth
        type="date"
        label="Start Date"
        InputLabelProps={{ shrink: true }}
        value={plan.startDate}
        onChange={(e) =>
          setPlan({ ...plan, startDate: e.target.value })
        }
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="date"
        label="End Date (Optional)"
        InputLabelProps={{ shrink: true }}
        value={plan.endDate}
        onChange={(e) =>
          setPlan({ ...plan, endDate: e.target.value })
        }
        sx={{ mb: 2 }}
      />
    </>
  )}

  {plan.type === "one_time" && (
    <TextField
      fullWidth
      type="date"
      label="Deposit Date"
      InputLabelProps={{ shrink: true }}
      value={plan.oneTimeDate}
      onChange={(e) =>
        setPlan({ ...plan, oneTimeDate: e.target.value })
      }
      sx={{ mb: 2 }}
    />
  )}

  {/* TARGET */}
  <TextField
    fullWidth
    label="Target Amount (Optional)"
    type="number"
    value={plan.target}
    onChange={(e) =>
      setPlan({ ...plan, target: e.target.value })
    }
    sx={{ mb: 2 }}
  />

  <Button
    fullWidth
    onClick={handleSavePlan}
    sx={{
      background: GOLD,
      color: "#000",
      fontWeight: "bold"
    }}
  >
    Save Plan
  </Button>

</Paper>

{/* =========================  
💰 HOW WE MAKE MONEY  
========================= */}  
<Paper sx={{ p: 2, mt: 4, background: CARD }}>  
  
  {/* HEADER */}  
  <Box display="flex" justifyContent="space-between" alignItems="center">  
    <Typography sx={{ color: GOLD, fontWeight: "bold" }}>  
     Our Cash Flow Model 
    </Typography>  
  
    <IconButton  
      onClick={() => setShowRevenue(!showRevenue)}  
      sx={{ color: GOLD }}  
    >  
      {showRevenue ? <ExpandLess /> : <ExpandMore />}  
    </IconButton>  
  </Box>  
  
  {/* COLLAPSIBLE CONTENT */}  
  <Collapse in={showRevenue}>  
  
    <Box mt={2}>  
  
      {/* SIMPLE INTRO */}  
      <Typography sx={{ color: SUB, fontSize: 13, mb: 2 }}>  
        Golden Biashnet is currently focused on growth — allowing users to post,  
        connect, and transact freely to build strong demand and trust.  
        <br /><br />  
        From September, revenue begins when transactions, visibility, and  
        services flow through our platform.  
      </Typography>  
  
      {/* CORE MODEL */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Our Core Model   
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        We do not operate as a traditional shop though we have a physical store which acts as our station/center.  
        <br /><br />  
        We act as a <b>transaction platform</b> that connects buyers, sellers,  
        service providers, and property owners — and earn from the activity  
        happening within the system designed Online  to The Biashnet Fulfillment Hub where orders are processed.  
      </Typography>  
  
      {/* PRODUCTS */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Products (Marketplace Flow)  
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        • Commission on every successful sale    
        <br />  
        • Delivery fees (fast local logistics)    
        <br />  
        • Seller drop-off & pickup handling fee    
        <br />  
        • Paid product visibility from promoted listings    
        <br /><br />  
        • On-demand sourcing:  
        When a product is needed, we facilitate or supply it —  
        without holding heavy inventory  
      </Typography>  
  
      {/* SERVICES */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Services  
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        • Contact access fee (clients pay to reach providers)    
        <br />  
        • Premium listing visibility    
        <br />  
        • Verification / trusted badge subscription    
        <br />  
        • Promotion for higher reach    
      </Typography>  
  
      {/* HOUSING */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Housing  
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        • House hunting access fee (verified listings)    
        <br />  
        • Listing subscription for landlords    
        <br />  
        • Featured listings for faster occupancy    
      </Typography>  
  
      {/* ADVERTISING */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Advertising  
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        • Paid promotions for businesses and events    
        <br />  
        • Featured advert placements    
        <br />  
        • Verified advertiser badges    
      </Typography>  
  
      {/* CASH FLOW SUMMARY */}  
      <Typography sx={{ color: GOLD, mt: 2 }}>  
        Where Cash Comes From  
      </Typography>  
  
      <Typography sx={{ color: TEXT, fontSize: 13 }}>  
        Revenue is generated from:  
        <br />  
        • Transactions happening on the platform  
        <br />  
        • Businesses paying for visibility  
        <br />  
        • Users paying for convenience, trust, and speed
       </Typography> 
        <Typography sx={{ color: TEXT, fontSize: 13, mt: 2 }}>
         <br />  
        The more the community uses Biashnet for their daily needs, the more value we create — and the more revenue we generate to sustain and grow the platform. 
        <br />   
      </Typography>  
  
      {/* SCALE */}  
      <Typography sx={{ color: SUB, fontSize: 13, mt: 3 }}>  
        We start with Juja to build strong usage and transaction flow.  
        <br /><br />  
        Once proven, the model scales to Central Kenya, then nationwide,  
        then across East Africa and Globally— expanding a proven system, not an idea.  
      </Typography>  
  
    </Box>  
  
  </Collapse>  
  
</Paper>
      </Container>
      <Dialog
  open={openSignupModal}
  onClose={() => setOpenSignupModal(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Create Account</DialogTitle>

  <DialogContent>
    {/* 🔥 Replace this with your actual Signup component */}
    <InvestorLogin onSuccess={() => setOpenSignupModal(false)} />

    <Button
      onClick={() => setOpenSignupModal(false)}
      fullWidth
      sx={{
        mt: 2,
        background: GOLD,
        color: "#000",
        fontWeight: "bold"
      }}
    >
      Close
    </Button>
  </DialogContent>
</Dialog>

    </Box>
  );
}