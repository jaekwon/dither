import Vue from "vue";
import Vuex from "vuex";
import VuexEasyFirestore from "vuex-easy-firestore";
Vue.use(Vuex);
import router from "../router/index.js";

// import firebase
import { Firebase, initFirebase } from "./firebase.js";

// import vuex-firestore modules
import accounts from "./modules/accounts.js";
import blockchains from "./modules/blockchains.js";
import memos from "./modules/memos.js";
import settings from "./modules/settings.js";

// connect vuex-firestore modules to firestore
const easyFirestore = VuexEasyFirestore(
  [accounts, blockchains, memos, settings],
  {
    logging: true,
    FirebaseDependency: Firebase
  }
);

const storeData = {
  plugins: [easyFirestore],
  getters: {
    accounts: state => {
      return state.accounts.data;
    },
    blockchain: state => {
      return state.blockchain;
    },
    blockchains: state => {
      return state.blockchains.data;
    },
    chainId: state => {
      return state.blockchain.chainId;
    },
    defaultAccounts: state => {
      return state.defaultAccounts.data;
    },
    following: state => {
      return state.following;
    },
    memos: state => {
      return state.memos.data;
    },
    settings: state => {
      return state.settings;
    },
    queuedMemos: state => {
      return state.queuedMemos;
    },
    user: state => {
      return state.user;
    },
    userSignedIn: state => {
      return state.userSignedIn;
    }
  },
  state: {
    blockchain: {
      chainId: "cosmoshub-3",
      lcd: "https://lcd.nylira.net",
      toAddress: "cosmos1lfq5rmxmlp8eean0cvr5lk49zglcm5aqyz7mgq",
      defaultGas: "100000",
      height: 0,
      // load the last x days of memos (at 7s per block)
      blockRange: (7 * 24 * 60 * 60) / 7
    },
    userSignedIn: false,
    user: {
      displayName: "Loading",
      providerData: [
        {
          photoURL: "Loading",
          displayName: "Loading",
          providerId: "Loading"
        }
      ]
    },
    following: [],
    queuedMemos: {},
    queuedTxSends: {}
  },
  mutations: {
    setHeight(state, height) {
      if (height > state.blockchain.height) {
        state.blockchain.height = height;
        // console.log("set blockchain height to", state.blockchain.height);
      }
    },
    setFollowing(state, following) {
      state.following = following;
    },
    addFollow(state, address) {
      state.following.push(address);
    },
    rmFollow(state, address) {
      state.following = state.following.filter(
        followingAddress => followingAddress !== address
      );
    },
    addQueuedMemo(state, memo) {
      Vue.set(state.queuedMemos, memo.id, memo);
      console.log("adding to queue:", state.queuedMemos[memo.id]);
    },
    addQueuedTxSends(state, txSend) {
      Vue.set(state.queuedTxSends, txSend.id, txSend);
      console.log("adding to queue:", state.queuedTxSends[txSend.id]);
    },
    rmQueuedMemo(state, id) {
      if (state.queuedMemos[id]) {
        // console.log("removing from queue", state.queuedMemos[id]);
        Vue.delete(state.queuedMemos, id);
      }
    },
    signInUser(state, user) {
      state.user = user;
      state.userSignedIn = true;
    },
    signOutUser(state) {
      Firebase.auth().signOut();
      state.user = {};
      state.userSignedIn = false;
      router.push({
        name: "login"
      });
    }
  }
};

// init Vuex
const store = new Vuex.Store(storeData);

// init Firebase
initFirebase().catch(error => {
  console.log("there was a firebase error", error);
  // take user to a page stating an error occurred
  // (might be a connection error, or the app is open in another tab)
});

export default store;
