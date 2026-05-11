import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  LinearProgress
} from "@mui/material";
import { Collapse, TextField } from "@mui/material";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
  setDoc,
  increment,
  deleteDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

import { db } from "../services/firebase";


// THEME
const GOLD = "#F4B400";
const BG = "#000";
const CARD = "#111";
const TEXT = "#fff";
const SUB = "#aaa";

export default function AdminInvestors() {

  const [investorPlans, setInvestorPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [editItem, setEditItem] = useState(null);
const [editAmount, setEditAmount] = useState("");
const [search, setSearch] = useState("");
const [showTransactions, setShowTransactions] = useState(false);
const [txSearch, setTxSearch] = useState("");

{/* ================= INVESTORS DIRECTORY ================= */}
const [allUsers, setAllUsers] = useState([]);
const [pledges, setPledges] = useState([]);
const [showInvestorsSection, setShowInvestorsSection] = useState(false);
const [investorSearch, setInvestorSearch] = useState("");
const [showInvestors, setShowInvestors] = useState(false);
const [platformInvestors, setPlatformInvestors] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    investors: 0
  });

// For merging investor names into plans
  const [allInvestors, setAllInvestors] = useState([]);

  const TARGET = 500000;

  const removeInvestment = async (item) => {
  try {
    await deleteDoc(doc(db, "investments", item.id));

    // 🔥 Rollback stats if already approved
    if (item.status === "approved") {
      const statsRef = doc(db, "investmentStats", "main");

      await updateDoc(statsRef, {
        totalRaised: increment(-item.amount)
      });
    }

  } catch (err) {
    console.error(err);
  }
};

// 🔥 EDIT INVESTMENT (EXTRA)
const updateInvestment = async () => {
  try {
    const ref = doc(db, "investments", editItem.id);

    const oldAmount = editItem.amount;
    const newAmount = Number(editAmount);

    await updateDoc(ref, {
      amount: newAmount
    });

    // 🔥 Adjust stats difference
    if (editItem.status === "approved") {
      const diff = newAmount - oldAmount;

      const statsRef = doc(db, "investmentStats", "main");

      await updateDoc(statsRef, {
        totalRaised: increment(diff)
      });
    }

    setEditItem(null);

  } catch (err) {
    console.error(err);
  }
};

/* ================= LOAD INVESTORS ================= */

useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "investors"),
    async (snapshot) => {

      const list = [];

      for (const docSnap of snapshot.docs) {

        const investorData = docSnap.data();

        // 🔥 Get member profile
        const memberSnap = await getDoc(
          doc(db, "members", investorData.userId)
        );

        list.push({
          id: docSnap.id,
          ...investorData,
          member: memberSnap.exists()
            ? memberSnap.data()
            : null
        });
      }

      setPlatformInvestors(list);
    }
  );

  return () => unsub();

}, []);

// =========================
// FETCH USERS
// =========================
useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "users"),
    (snapshot) => {

      const list = [];

      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });

      setAllUsers(list);
    }
  );

  return () => unsub();

}, []);

/* ================= LOAD PLEDGES ================= */

useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "pledges"),
    (snapshot) => {

      const list = [];

      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setPledges(list);
    }
  );

  return () => unsub();

}, []);

// =========================
// FULL INVESTOR DATA
// =========================
const mergedInvestors = allInvestors.map((investor) => {

  const user = allUsers.find(
    (u) => u.userId === investor.userId
  );

  const pledge = pledges.find(
    (p) => p.userId === investor.userId
  );

  const plan = investorPlans.find(
    (p) => p.userId === investor.userId
  );

  return {
    ...investor,

    phone: user?.phone || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",

    pledgeAmount: pledge?.pledgeAmount || 0,

    planType: plan?.planType || "No Plan",
    expectedTotal: plan?.expectedTotal || 0
  };

});

/* ================= FILTER ================= */

const filteredInvestors = mergedInvestors.filter((item) =>
  item.name
    ?.toLowerCase()
    .includes(investorSearch.toLowerCase())
);

/* ================= TOTALS ================= */
const totalPledges = mergedInvestors.reduce(
  (sum, item) => sum + (item.pledgeAmount || 0),
  0
);
const totalInvestorsCount = mergedInvestors.length;

  // =========================
  // FETCH INVESTMENTS
  // =========================
  useEffect(() => {

    const q = query(
      collection(db, "investments"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const list = [];

      let total = 0;
      let approved = 0;
      let pending = 0;

      const investorsSet = new Set();

      snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        list.push({
          id: docSnap.id,
          ...data
        });

        total += data.amount;

        if (data.status === "approved") {
          approved += data.amount;
          investorsSet.add(data.userId);
        }

        if (data.status === "pending") {
          pending += data.amount;
        }

      });

      setInvestments(list);

      setStats({
        total,
        approved,
        pending,
        investors: investorsSet.size
      });

    });

    return () => unsub();

  }, []);

  // =========================
  // FETCH TOP INVESTORS
  // =========================
  useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "investors"),
    (snapshot) => {

      const list = [];

      snapshot.forEach(doc => {
        list.push(doc.data());
      });

      setAllInvestors(list); // ✅ NOT slice(0,5)
    }
  );

  return () => unsub();

}, []);

  useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "investmentPlans"),
    (snapshot) => {

      const list = [];

      snapshot.forEach(doc => {
        list.push(doc.data());
      });

      setInvestorPlans(list);
    }
  );

  return () => unsub();

}, []);

  // =========================
  // APPROVE (🔥 FIXED)
  // =========================
  const approve = async (item) => {

    try {

      // 1️⃣ Update investment
      await updateDoc(doc(db, "investments", item.id), {
        status: "approved",
        approvedAt: serverTimestamp()
      });

      // 2️⃣ Update investor
      const investorRef = doc(db, "investors", item.userId);

      await setDoc(
        investorRef,
        {
          userId: item.userId,
          name: item.name,
          totalInvested: increment(item.amount),
          contributionsCount: increment(1),
          lastContributionAt: serverTimestamp(),
          status: "active"
        },
        { merge: true }
      );

      const investorsWithPlans = investorPlans.map(plan => {

  const investor = allInvestors.find(
    inv => inv.userId === plan.userId
  );

  return {
    ...plan,
    name: investor?.name || "Unknown",
    totalInvested: investor?.totalInvested || 0
  };

});
      // 3️⃣ Update global stats (CORRECT COLLECTION)
      const statsRef = doc(db, "investmentStats", "main");

      const statsSnap = await getDoc(statsRef);

      if (!statsSnap.exists()) {

        await setDoc(statsRef, {
          totalRaised: item.amount,
          investorsCount: 1,
          target: TARGET,
          lastUpdated: serverTimestamp()
        });

      } else {

       // Check if investor already existed
const investorRef = doc(db, "investors", item.userId);
const investorSnap = await getDoc(investorRef);

const isNewInvestor = !investorSnap.exists();

await updateDoc(statsRef, {
  totalRaised: increment(item.amount),
  investorsCount: isNewInvestor ? increment(1) : increment(0),
  lastUpdated: serverTimestamp()
}); 

      }

    } catch (err) {
      console.error(err);
    }

  };

  // =========================
  // REJECT
  // =========================
  const reject = async (id) => {

    await updateDoc(doc(db, "investments", id), {
      status: "rejected"
    });

  };

  // =========================
  // KPI CALCULATIONS
  // =========================
  const remaining = TARGET - stats.approved;

  const percentage = Math.min(
    (stats.approved / TARGET) * 100,
    100
  );

  const remainingPercent = 100 - percentage;


// =========================
// MERGE INVESTOR DATA
// =========================
const mergedData = investorPlans.map(plan => {

  const investor = allInvestors.find(
    inv => inv.userId === plan.userId
  );

  const total = investor?.totalInvested || 0;

  const progress = plan.expectedTotal
    ? Math.min((total / plan.expectedTotal) * 100, 100)
    : 0;

  const remaining = (plan.expectedTotal || 0) - total;

  return {
    userId: plan.userId,
    name: investor?.name || "Unknown",

    // PLAN INFO
    planType: plan.planType,
    amountPerCycle: plan.amountPerCycle || 0,
    startDate: plan.startDate,
    endDate: plan.endDate,
    status: plan.status,

    // MONEY
    target: plan.targetAmount || 0,
    expected: plan.expectedTotal || 0,
    invested: total,
    remaining,

    // CALCULATED
    progress,

    // 🔥 SMART FLAG
    isBehind: total < (plan.expectedTotal || 0) * 0.3 // simple logic
  };

});
const filteredPlans = mergedData.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
);
  // =========================
  // UI
  // =========================

  const filteredTransactions = investments.filter((item) =>
  item.name?.toLowerCase().includes(txSearch.toLowerCase())
);

  const formatDate = (date) => {

  if (!date) return "-";

  // Firestore timestamp
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }

  // Already string
  return date;
};
  return (

    <Box sx={{ background: BG, minHeight: "100vh", pb: 4 }}>

      <Container maxWidth="sm">

        <Typography sx={{ color: GOLD, py: 3, fontSize: 20 }}>
          Admin Dashboard
        </Typography>

        {/* 🔥 PROGRESS */}
        <Paper sx={{ p: 2, mb: 2, background: CARD }}>

          <Typography color={SUB}>Progress</Typography>

          <Typography sx={{ color: TEXT, fontSize: 22 }}>
            Ksh {stats.approved.toLocaleString()}
          </Typography>

          <Typography color={SUB}>
            {percentage.toFixed(1)}% funded
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

        {/* 🔥 KPI GRID */}
        <Grid container spacing={2}>

          <Grid item xs={6}>
            <Paper sx={{ p: 2, background: CARD }}>
              <Typography color={SUB}>Remaining</Typography>
              <Typography sx={{ color: "#ff7043" }}>
                Ksh {remaining.toLocaleString()}
              </Typography>
              <Typography color={SUB}>
                {remainingPercent.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper sx={{ p: 2, background: CARD }}>
              <Typography color={SUB}>Investors</Typography>
              <Typography sx={{ color: TEXT }}>
                {stats.investors}
              </Typography>
            </Paper>
          </Grid>

        </Grid>

        {/* TOP INVESTORS */}
        <Paper sx={{ p: 2, mt: 3, background: CARD }}>
          <Typography sx={{ color: GOLD, mb: 1 }}>
            Top Investors
          </Typography>

          {allInvestors.map((inv, i) => (
            <Box key={i} display="flex" justifyContent="space-between" mb={1}>
              <Typography sx={{ color: TEXT }}>
                {inv.name}
              </Typography>
              <Typography sx={{ color: GOLD }}>
                Ksh {inv.totalInvested}
              </Typography>
            </Box>
          ))}
        </Paper>
        
        {/* INVESTOR PLANS */}
<Paper sx={{ p: 2, mt: 3, background: CARD }}>

  {/* HEADER */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography sx={{ color: GOLD, fontWeight: "bold" }}>
      Investor Plans Overview
    </Typography>

    <Button
      onClick={() => setShowPlans(!showPlans)}
      sx={{ color: GOLD }}
    >
      {showPlans ? "Hide" : "View"}
    </Button>
  </Box>

  <Collapse in={showPlans}>

    {/* SEARCH */}
    <TextField
      fullWidth
      placeholder="Search investor..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ mt: 2, mb: 2 }}
      InputProps={{
        style: { color: TEXT }
      }}
    />

    {/* HEADER ROW */}
    <Grid container sx={{ borderBottom: "1px solid #333", pb: 2, mb: 2 }}>
      <Grid item xs={3}>
        <Typography sx={{ color: SUB, fontSize: 12 }}>Investor</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography sx={{ color: SUB, fontSize: 12 }}>Plan</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography sx={{ color: SUB, fontSize: 12 }}>Expected</Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography sx={{ color: SUB, fontSize: 12 }}>Invested</Typography>
      </Grid>
      <Grid item xs={3}>
        <Typography sx={{ color: SUB, fontSize: 12 }}>Progress</Typography>
      </Grid>
    </Grid>

    {/* BODY */}
    {filteredPlans.length === 0 && (
      <Typography sx={{ color: SUB, mt: 2 }}>
        No investors found
      </Typography>
    )}

    {filteredPlans.map((item, i) => (

      <Box key={i} sx={{ py: 2, borderBottom: "1px solid #222" }}>

        {/* MAIN ROW */}
        <Grid container alignItems="center">

          {/* NAME */}
          <Grid item xs={3}>
            <Typography sx={{ color: TEXT, fontSize: 13, fontWeight: "bold" }}>
              {item.name}
            </Typography>
          </Grid>

          {/* PLAN */}
          <Grid item xs={2}>
            <Chip
              label={item.planType}
              size="small"
              sx={{
                background: "#222",
                color: GOLD,
                fontSize: 10
              }}
            />
          </Grid>

          {/* EXPECTED */}
          <Grid item xs={2}>
            <Typography sx={{ color: SUB, fontSize: 12 }}>
              Ksh {item.expected.toLocaleString()}
            </Typography>
          </Grid>

          {/* INVESTED */}
          <Grid item xs={4}>
            <Typography sx={{ color: GOLD, fontSize: 12 }}>
              Ksh {item.invested.toLocaleString()}
            </Typography>
          </Grid>

          {/* PROGRESS */}
          <Grid item xs={5}>
            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 6,
                borderRadius: 5,
                mb: 0.5,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: GOLD
                }
              }}
            />

            <Typography sx={{ fontSize: 10, color: SUB }}>
              {item.progress.toFixed(0)}%
            </Typography>
          </Grid>

        </Grid>

        {/* DETAILS ROW */}
        <Box
          display="flex"
          justifyContent="space-between"
          mt={1}
          flexWrap="wrap"
        >

          <Typography sx={{ fontSize: 11, color: SUB }}>
            Cycle: Ksh {item.amountPerCycle}
          </Typography>

          <Typography sx={{ fontSize: 11, color: SUB }}>
            Target: Ksh {item.target.toLocaleString()}
          </Typography>

          <Typography sx={{ fontSize: 11, color: SUB }}>
            Remaining: Ksh {item.remaining.toLocaleString()}
          </Typography>

          <Typography sx={{ fontSize: 11, color: SUB }}>
            {formatDate(item.startDate)} → {formatDate(item.endDate)}
          </Typography>

          {/* STATUS */}
          <Chip
            label={item.status}
            size="small"
            sx={{
              background:
                item.status === "active" ? "#2e7d32" : "#555",
              color: "#fff",
              fontSize: 10
            }}
          />

        </Box>

        {/* WARNING */}
        {item.isBehind && (
          <Typography sx={{ color: "#ff4444", fontSize: 11, mt: 1 }}>
            ⚠ Behind expected contribution pace
          </Typography>
        )}

      </Box>

    ))}

  </Collapse>

</Paper>
      {/* ================= TRANSACTIONS ================= */}
<Paper sx={{ p: 2, mt: 3, background: CARD }}>

  {/* HEADER */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography sx={{ color: GOLD, fontWeight: "bold" }}>
      All Transactions
    </Typography>

    <Button
      onClick={() => setShowTransactions(!showTransactions)}
      sx={{ color: GOLD }}
    >
      {showTransactions ? "Hide" : "View"}
    </Button>
  </Box>

  <Collapse in={showTransactions}>

    {/* SEARCH */}
    <TextField
      fullWidth
      placeholder="Search investor transactions..."
      value={txSearch}
      onChange={(e) => setTxSearch(e.target.value)}
      sx={{ mt: 2, mb: 2 }}
      InputProps={{
        style: { color: TEXT }
      }}
    />

    {/* EMPTY */}
    {filteredTransactions.length === 0 && (
      <Typography sx={{ color: SUB }}>
        No transactions found
      </Typography>
    )}

    {/* LIST */}
    {filteredTransactions.map((item) => (

      <Paper
        key={item.id}
        sx={{
          p: 2,
          mb: 2,
          background: "#0d0d0d",
          border: "1px solid #1f1f1f"
        }}
      >

        {/* NAME */}
        <Typography sx={{ color: TEXT, fontWeight: "bold" }}>
          {item.name}
        </Typography>

        {/* AMOUNT */}
        <Typography sx={{ color: GOLD }}>
          Ksh {item.amount.toLocaleString()}
        </Typography>

        {/* STATUS */}
        <Chip
          label={item.status}
          size="small"
          sx={{
            mt: 1,
            background:
              item.status === "approved"
                ? "#2e7d32"
                : item.status === "rejected"
                ? "#d32f2f"
                : "#ff9800",
            color: "#fff"
          }}
        />

        {/* TIME */}
        <Typography sx={{ color: SUB, fontSize: 12, mt: 1 }}>
          Created:{" "}
          {item.createdAt?.seconds
            ? new Date(item.createdAt.seconds * 1000).toLocaleString()
            : ""}
        </Typography>

        {item.approvedAt && (
          <Typography sx={{ color: "#2e7d32", fontSize: 12 }}>
            Approved:{" "}
            {new Date(item.approvedAt.seconds * 1000).toLocaleString()}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        {/* ACTIONS */}
        <Grid container spacing={1}>

          <Grid item xs={4}>
            <Button
              fullWidth
              onClick={() => {
                setEditItem(item);
                setEditAmount(item.amount);
              }}
              sx={{ background: "#1976d2", color: "#fff" }}
            >
              Edit
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button
              fullWidth
              onClick={() => removeInvestment(item)}
              sx={{ background: "#d32f2f", color: "#fff" }}
            >
              Delete
            </Button>
          </Grid>

        </Grid>

        {/* EDIT MODE */}
        {editItem?.id === item.id && (
          <Box mt={2}>
            <TextField
              fullWidth
              type="number"
              label="New Amount"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              sx={{ mb: 1 }}
            />

            <Button
              fullWidth
              onClick={updateInvestment}
              sx={{ background: GOLD, color: "#000" }}
            >
              Save Changes
            </Button>
          </Box>
        )}

        {/* APPROVE / REJECT */}
        {item.status === "pending" && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                onClick={() => approve(item)}
                sx={{ background: "#2e7d32", color: "#fff" }}
              >
                Approve
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button
                fullWidth
                onClick={() => reject(item.id)}
                sx={{ background: "#d32f2f", color: "#fff" }}
              >
                Reject
              </Button>
            </Grid>
          </Grid>
        )}

      </Paper>

    ))}

  </Collapse>

</Paper> 
{/* =========================
🔥 INVESTORS DIRECTORY
========================= */}

<Paper
  sx={{
    mt: 3,
    background: CARD,
    border: "1px solid #1f1f1f",
    overflow: "hidden"
  }}
>

  {/* HEADER */}
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      p: 2,
      borderBottom: showInvestorsSection
        ? "1px solid #1f1f1f"
        : "none"
    }}
  >
    <Box>
      <Typography
        sx={{
          color: GOLD,
          fontWeight: "bold",
          fontSize: 18
        }}
      >
        Platform Investors
      </Typography>

      <Typography
        sx={{
          color: SUB,
          fontSize: 12,
          mt: 0.5
        }}
      >
        Manage investors, pledges, contacts & plans
      </Typography>
    </Box>

    <Button
      onClick={() =>
        setShowInvestorsSection(!showInvestorsSection)
      }
      sx={{
        color: GOLD,
        border: `1px solid ${GOLD}`,
        minWidth: 90
      }}
    >
      {showInvestorsSection ? "Hide" : "View"}
    </Button>
  </Box>

  {/* COLLAPSE */}
  <Collapse in={showInvestorsSection} timeout="auto">

    <Box sx={{ p: 2 }}>

      {/* ================= KPI ================= */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: "#0d0d0d",
              border: "1px solid #1f1f1f",
              borderRadius: 3
            }}
          >
            <Typography
              sx={{
                color: SUB,
                fontSize: 12
              }}
            >
              Total Pledges
            </Typography>

            <Typography
              sx={{
                color: GOLD,
                fontWeight: "bold",
                fontSize: 20,
                mt: 1
              }}
            >
              Ksh {totalPledges.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: "#0d0d0d",
              border: "1px solid #1f1f1f",
              borderRadius: 3
            }}
          >
            <Typography
              sx={{
                color: SUB,
                fontSize: 12
              }}
            >
              Total Investors
            </Typography>

            <Typography
              sx={{
                color: TEXT,
                fontWeight: "bold",
                fontSize: 20,
                mt: 1
              }}
            >
              {mergedInvestors.length}
            </Typography>
          </Paper>
        </Grid>

      </Grid>

      {/* ================= SEARCH ================= */}
      <TextField
        fullWidth
        placeholder="Search investor by name..."
        value={investorSearch}
        onChange={(e) =>
          setInvestorSearch(e.target.value)
        }
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            background: "#0d0d0d",
            color: TEXT,
            borderRadius: 3
          }
        }}
        InputProps={{
          style: {
            color: TEXT
          }
        }}
      />

      {/* EMPTY */}
      {filteredInvestors.length === 0 && (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            background: "#0d0d0d",
            border: "1px solid #1f1f1f"
          }}
        >
          <Typography sx={{ color: SUB }}>
            No investors found
          </Typography>
        </Paper>
      )}

      {/* ================= INVESTORS LIST ================= */}
      <Box>

        {filteredInvestors.map((item, index) => (

          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              background: "#0d0d0d",
              border: "1px solid #1f1f1f",
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": {
                border: `1px solid ${GOLD}`
              }
            }}
          >

            {/* TOP */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >

              <Box>

                {/* NAME */}
                <Typography
                  sx={{
                    color: GOLD,
                    fontWeight: "bold",
                    fontSize: 16
                  }}
                >
                  {item.name || "Unnamed Investor"}
                </Typography>

                {/* PHONE */}
                <Typography
                  sx={{
                    color: TEXT,
                    fontSize: 13,
                    mt: 0.5
                  }}
                >
                  📞 {item.phone || "No phone"}
                </Typography>

                {/* EMAIL */}
                <Typography
                  sx={{
                    color: SUB,
                    fontSize: 12,
                    mt: 0.5
                  }}
                >
                  {item.email || "No email"}
                </Typography>

              </Box>

              {/* STATUS */}
              <Chip
                label={item.status || "inactive"}
                size="small"
                sx={{
                  background:
                    item.status === "active"
                      ? "#2e7d32"
                      : "#444",
                  color: "#fff",
                  fontSize: 11
                }}
              />

            </Box>

            {/* STATS */}
            <Grid container spacing={2} sx={{ mt: 1 }}>

              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    background: "#111",
                    borderRadius: 2
                  }}
                >
                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 10
                    }}
                  >
                    Invested
                  </Typography>

                  <Typography
                    sx={{
                      color: GOLD,
                      fontWeight: "bold",
                      fontSize: 13,
                      mt: 0.5
                    }}
                  >
                    Ksh {(
                      item.totalInvested || 0
                    ).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    background: "#111",
                    borderRadius: 2
                  }}
                >
                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 10
                    }}
                  >
                    Pledge
                  </Typography>

                  <Typography
                    sx={{
                      color: "#4caf50",
                      fontWeight: "bold",
                      fontSize: 13,
                      mt: 0.5
                    }}
                  >
                    Ksh {(
                      item.pledgeAmount || 0
                    ).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    background: "#111",
                    borderRadius: 2
                  }}
                >
                  <Typography
                    sx={{
                      color: SUB,
                      fontSize: 10
                    }}
                  >
                    Contributions
                  </Typography>

                  <Typography
                    sx={{
                      color: TEXT,
                      fontWeight: "bold",
                      fontSize: 13,
                      mt: 0.5
                    }}
                  >
                    {item.contributionsCount || 0}
                  </Typography>
                </Paper>
              </Grid>

            </Grid>

            {/* PLAN */}
            <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >

              <Typography
                sx={{
                  color: SUB,
                  fontSize: 12
                }}
              >
                Plan:{" "}
                <span style={{ color: GOLD }}>
                  {item.planType || "Not Set"}
                </span>
              </Typography>

              <Typography
                sx={{
                  color: SUB,
                  fontSize: 12
                }}
              >
                Last Activity:{" "}
                {item.lastContributionAt?.seconds
                  ? new Date(
                      item.lastContributionAt.seconds * 1000
                    ).toLocaleDateString()
                  : "-"}
              </Typography>

            </Box>

            {/* BUTTONS */}
            <Box
              display="flex"
              gap={1}
              mt={2}
              flexWrap="wrap"
            >

              {/* COPY */}
              <Button
                size="small"
                onClick={() => {
                  if (item.phone) {
                    navigator.clipboard.writeText(item.phone);
                  }
                }}
                sx={{
                  background: "#1a1a1a",
                  color: TEXT,
                  borderRadius: 2,
                  px: 2,
                  "&:hover": {
                    background: "#222"
                  }
                }}
              >
                Copy Number
              </Button>

              {/* WHATSAPP */}
              {item.phone && (
                <Button
                  size="small"
                  href={`https://wa.me/${item.phone.replace(/\+/g, "")}`}
                  target="_blank"
                  sx={{
                    background: "#25D366",
                    color: "#fff",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      background: "#1ebe5d"
                    }
                  }}
                >
                  WhatsApp
                </Button>
              )}

            </Box>

          </Paper>

        ))}

      </Box>

    </Box>

  </Collapse>

</Paper>
      </Container>

    </Box>
  );
}