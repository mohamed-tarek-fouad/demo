const express = require("express");
const app = express();
const { getAuth } = require("firebase-admin/auth");

const cors = require("cors");
const admin = require("firebase-admin");
const Joi = require("joi");
const fs = require("fs");
const PDFDocument = require("pdfkit");
var serviceAccount = {
  type: "service_account",
  project_id: "graduation-demo",
  private_key_id: "799e1b8fcf889eb95707cd55addfcc6c9bd77931",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCg/XnItp62pFya\nU9OS3TFcy4T8r7/wEunUfnx3dTxui16mRoXC5E8pPKen9jMN4IytEvnzzrhTAh6V\nMZvFmgCKydzXqqBXidw10gOx0NrJP892jt4Bq/QJcl83vXd3S1y0Auh7EecivXNU\nLPYTG9pzoaQAV+0xdX+J8ll9DlseQwqZPOjVe9ITaxJjwPBuvz/jhN+t8b/8pBgV\npRf1K9cuzo0jwgjkp3eQpWU0XeDKuo/QDvu+O1kX2FxObZ/nHnx9g/DcppfLFCTr\noSxWZ4KkheMymWy09JwVQw9NHbBcrnjIr8pIbDLFnvvupuAS7+7h8qPc8Qf1vAyB\nuZ/R5kjtAgMBAAECggEAAl7ZHTh7K8tNxcP4OJBjOq+QfLwFwn40zTkzkfq68hHB\nSgd9zrnX5I6NFW8Nn2WwDJhb79gaZLaCRsYdOhKjcWe5hb9wbvmLsYsvHL4rio0S\n+/bsk++5Py5c8pAqoyoL6makj7NayOsrOJEU6oEdfVhi9tJUnsbRIvHbmXjNpKto\nDFCMlT/LGHSLojmMZ28gu1Zlf1kIxfo0gR3BdqBfUTc7BXD1kXUYwUrNuESMJn/j\npZJsBn8V/uabonyQ/GjQzobmoWws8Rr90scxHxHnhS4MptPN+KIOZTE8L7s+ctvS\niTALoXwAZ3uXStACbbk4dcWAPCdS+JJaxcmJ5Nr0IQKBgQDblsro2JGAKMZJBaGg\n0NHKd1ctNY7Yv5lM57EIVsia5jSyp5JJDdV2a2kD0Y49X0/GYS6sn35C5jffknS3\nHnmNfLfyZeOprRchiR8vVH9eYghowwhEkT++vphJcBZw+viRNDsPRVnIZgdNCCOo\n7sxLQ9E4ITs7QCZc0UyPi+nVJQKBgQC7r0CvISjV9mlW01R3ag5PXQXyvLBVmApm\njR8mEQjJyi4VuxBxeDPWmMB9ONM9zY/jTwYWGv6/LxRGU2WNAGggQVayPcbQEL3k\n8Cp4j4/pFC3v/V+aGI6n80iEWM1eIKTSWrwj7J7H4/iSaGwSVl8DpykcxRyyeUdV\n/DcHrgSuKQKBgCFKq1jB/M1BYU6Q3ABVqHjZvw3LoOybn9JZDi4FekSBwluTrEoH\nHuXlQvahPr9vQ9j/wuPJCot5+96Zhbh9llAtKHZHnEyNQYSEFYZHeUgF9OBtMUO0\nAcYZf10i8UQPyL+6+3lFOmd3kIPNSBrEmZSPo5iu8Rv6jdZkpQbeX4VBAoGAad/h\nE2oXSSvqHIq2eW6gh/Cn7Fi4+G/+Xf959NVjKcId4TBXhEsUoxgkbf9iWtjdNJNd\nkZbE4kDCpTFidfomwxtYts/WmYT4Om+o5b3Gpus1Rs6d4aW8w82fuNkHcPPlRqzc\nuT9ACu71SFITtPx4OO1RaeNf3uY/cagHuxNVnJECgYA9VXmCALQCOpNKkxAbpZkE\n1H0S8I4rekmZF9/FbqYPuA8hVOhJRhpggQ12vYN+E0hqKpCeQir2lmbzCBCWx+EX\n8Sf3pOfRuFZxvUfhXRzVLvd2XiVBwviWnx8udJV79JdfTPgk2AP3iPAL8cKs0w3I\nOwu4ZpMOSA82DAGd1g7IGw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-lpg0i@graduation-demo.iam.gserviceaccount.com",
  client_id: "112493052030055901436",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lpg0i%40graduation-demo.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://graduation-demo.appspot.com",
});
const authMiddleware = async (req, res, next) => {
  try {
    // Authentication for the customer account
    // Should be used as a middleware for all customers
    req.language = req.headers["accept-language"] || "en";
    req.userType = req.headers["user-type"];

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      throw new Error("Not Authenticated");
    }

    const { uid } = await getAuth().verifyIdToken(idToken);
    const authUser = await getAuth().getUser(uid);
    req.authUser = authUser;

    const user = (
      await admin.firestore().collection("users").where("authId", "==", uid).get()
    ).docs[0].data();
    if (user && user.status === "disabled") {
      throw new Error("User is disabled");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new Error(error);
  }
};
const signup = async (req, res) => {
  try {
    const { email, name, age, doctorPhone } = req.body;
    Joi.assert(
      req.body,
      Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        age: Joi.number().required(),
        doctorPhone: Joi.string().required(),
      })
    );
    const validateUserExist = await admin
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .get();
    if (validateUserExist.docs.length > 0) {
      return res.status(400).json({ message: "User already exist", status: "failed", data: {} });
    }
    const docRef = admin.firestore().collection("users").doc(); // Create a document reference with an auto-generated ID

    // Set the data including the doc ID
    await docRef.set({
      id: docRef.id, // Include the document's ID in the data
      email,
      name,
      age,
      doctorPhone,
    });
    res.status(200).json({ message: "User created successfully", status: "success", data: {} });
  } catch (error) {
    res.status(400).json({ message: error.message, status: "failed", data: {} });
  }
};
const findUser = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await admin.firestore().collection("users").doc(id).get();
    if (!user) {
      return res.status(400).json({ message: "User not found", status: "failed", data: {} });
    } else {
      res
        .status(200)
        .json({ message: "User found successfully", status: "success", data: user.data() });
    }
  } catch (error) {
    res.status(400).json({ message: error.message, status: "failed", data: {} });
  }
};

app.use(cors({ origin: true }));
app.use(express.json());

app.post("/signup", signup);
app.get("/findUser", authMiddleware, findUser);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
