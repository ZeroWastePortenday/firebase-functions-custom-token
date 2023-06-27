const functions = require('firebase-functions');
require("dotenv").config();

const createKakaoFirebaseToken = require('./kakao');
const createNaverFirebaseToken = require('./naver');

const admin = require('firebase-admin');
const serviceAccount = require("./admin-sdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

exports.kakaoCustomAuth = functions.region('asia-northeast1')
    .https
    .onCall(async (data, _) => {
        const token = data
        if (!token) return {error: 'There is no token.', message: 'Access token is a required parameter.'};

        console.log(`Verifying Kakao token: ${token}`)
        let firebaseToken = await createKakaoFirebaseToken(token);
        console.log(`Returning firebase token to user: ${firebaseToken}`)
        return {firebase_token: firebaseToken};
    })

exports.naverCustomAuth = functions.region('asia-northeast1')
    .https
    .onCall(async (data, _) => {
        const token = data
        if (!token) return {error: 'There is no token.', message: 'Access token is a required parameter.'}

        console.log(`Verifying naver token: ${token}`)
        let firebaseToken = await createNaverFirebaseToken(token);
        console.log(`Returning firebase token to user: ${firebaseToken}`)
        return {firebase_token: firebaseToken};
    })