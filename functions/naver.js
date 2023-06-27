const request = require('request-promise')
const admin = require('firebase-admin')
const naverRequestMeUrl = 'https://openapi.naver.com/v1/nid/me'

function requestMe(naverAccessToken) {
    console.log('Requesting user profile from Naver API server.')
    return request({
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + naverAccessToken,
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        },
        url: naverRequestMeUrl
    })
}

function updateOrCreateUser(userId, email, displayName, photoURL) {
    console.log('updating or creating a firebase user');
    const updateParams = {
        provider: 'NAVER',
        displayName: displayName,
    };
    if (displayName) {
        updateParams['displayName'] = displayName;
    } else {
        updateParams['displayName'] = email;
    }
    if (photoURL) {
        updateParams['photoURL'] = photoURL;
    }
    console.log(updateParams);
    return admin.auth().updateUser(userId, updateParams)
        .catch((error) => {
            if (error.code === 'auth/user-not-found') {
                updateParams['uid'] = userId;
                if (email) {
                    updateParams['email'] = email;
                }
                return admin.auth().createUser(updateParams);
            }
            throw error;
        });
}

module.exports = function createNaverFirebaseToken(naverAccessToken) {
    return requestMe(naverAccessToken).then((response) => {
        const body = JSON.parse(response)
        console.log(body)
        const userId = `naver:${body.response.id}`
        if (!userId) {
            return {message: 'There was no user with the given access token.'}
        }
        let name = null
        let profileImage = null
        if (body.properties) {
            name = body.response.name
            profileImage = body.response.profile_image
        }
        return updateOrCreateUser(userId, body.response.email, name,
            profileImage)
    }).then((userRecord) => {
        const userId = userRecord.uid
        console.log(`creating a custom firebase token based on uid ${userId}`)
        return admin.auth().createCustomToken(userId, {provider: 'NAVER'})
    })
}