export const calculateSellerTrust=(user)=>{

const completedOrders=Number(user.completedOrders||0);
const ordersCount=Number(user.ordersCount||0);
const listingsCount=Number(user.listingsCount||0);
const totalRatings=Number(user.totalRatings||0);

const sellerVerified=Boolean(user.sellerVerified);
const subscriptionActive=Boolean(user.subscriptionActive);

const badgeLevel=user.badgeLevel||"regular";

const createdAt=user.createdAt?.seconds?new Date(user.createdAt.seconds*1000):null;

const lastLoginAt=user.lastLoginAt?.seconds?new Date(user.lastLoginAt.seconds*1000):null;

/* ================= ACCOUNT AGE ================= */

let accountAgeMonths=0;

if(createdAt){

accountAgeMonths=
(Date.now()-createdAt.getTime())/
(1000*60*60*24*30);

}

/* ================= TRUST SCORE ================= */

let trustScore=0;

/* COMPLETED ORDERS */

trustScore+=Math.min(completedOrders*0.45,35);

/* ORDERS */

trustScore+=Math.min(ordersCount*0.08,10);

/* LISTINGS */

trustScore+=Math.min(listingsCount*0.25,10);

/* ACCOUNT AGE */

trustScore+=Math.min(accountAgeMonths*0.8,15);

/* RATINGS */

trustScore+=Math.min(totalRatings*0.15,10);

/* VERIFIED */

if(sellerVerified) trustScore+=10;

/* SUBSCRIPTION */

if(subscriptionActive) trustScore+=5;

/* BADGE BOOST */

if(badgeLevel==="verified") trustScore+=3;

if(badgeLevel==="premium") trustScore+=7;

if(badgeLevel==="golden") trustScore+=12;

/* ACTIVITY */

if(lastLoginAt){

const daysInactive=
(Date.now()-lastLoginAt.getTime())/
(1000*60*60*24);

if(daysInactive<=2) trustScore+=5;
else if(daysInactive<=7) trustScore+=3;
else if(daysInactive>30) trustScore-=5;

}

/* LIMIT */

trustScore=Math.max(
0,
Math.min(Number(trustScore.toFixed(1)),100)
);

/* ================= STAR SYSTEM ================= */

let stars=1;

if(trustScore>=15) stars=1.5;
if(trustScore>=28) stars=2;
if(trustScore>=40) stars=2.5;
if(trustScore>=52) stars=3;
if(trustScore>=65) stars=3.5;
if(trustScore>=78) stars=4;
if(trustScore>=88) stars=4.5;

if(
trustScore>=96 &&
completedOrders>=80 &&
sellerVerified
){
stars=5;
}

/* ================= BADGES ================= */

const badges={

regular:{
level:"regular",
label:"Regular Seller",
color:"#bdbdbd",
bg:"rgba(255,255,255,.08)",
border:"#444"
},

verified:{
level:"verified",
label:"Verified Seller",
color:"#42a5f5",
bg:"rgba(66,165,245,.1)",
border:"#42a5f5"
},

premium:{
level:"premium",
label:"Premium Seller",
color:"#ab47bc",
bg:"rgba(171,71,188,.12)",
border:"#ab47bc"
},

golden:{
level:"golden",
label:"Golden Seller",
color:"#F4B400",
bg:"rgba(244,180,0,.12)",
border:"#F4B400"
}

};

let badge=badges.regular;

/* USER COLLECTION BADGE OVERRIDES AUTO */

if(badgeLevel==="verified"){
badge=badges.verified;
}

if(badgeLevel==="premium"){
badge=badges.premium;
}

if(badgeLevel==="golden"){
badge=badges.golden;
}

/* ================= STATUS ================= */

let status="New Marketplace Seller";

if(trustScore>=25){
status="Growing Marketplace Seller";
}

if(trustScore>=50){
status="Trusted Marketplace Seller";
}

if(trustScore>=75){
status="Highly Trusted Seller";
}

if(trustScore>=90){
status="Elite Marketplace Seller";
}

return{
trustScore,
sellerRating:stars,
badge,
status
};

};