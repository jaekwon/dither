<template lang="pug">
.infinite-feed
  template(v-if="Object.keys(queued).length > 0")
    card-memo(v-for="memo in filteredQueued" :memo="memo" :key="memo.id")

  template(v-if="Object.keys(memos).length > 0")
    card-memo(v-for="memo in filteredMemos" :memo="memo" :key="memo.id")
    btn-load-more(:account="account")

  card-loading(v-else)
</template>

<script>
import { orderBy, pickBy, map, uniq } from "lodash";
import BtnLoadMore from "./BtnLoadMore";
import CardLoading from "./CardLoading";
import CardMemo from "./CardMemo";
export default {
  name: "infinite-feed",
  components: {
    BtnLoadMore,
    CardLoading,
    CardMemo
  },
  computed: {
    filteredMemos() {
      let memos = [];

      if (this.memos) {
        memos = this.memos;

        // only include users following
        if (this.following) {
          memos = pickBy(this.memos, m => this.following.includes(m.address));
        }

        memos = this.filterMemoTypes(memos);
        memos = this.combineMemoReposts(memos);
        memos = orderBy(memos, m => parseInt(m.height), "desc");
      }
      return memos;
    },
    filteredQueued() {
      let memos = [];
      if (this.queued) {
        memos = this.queued;
        memos = this.filterMemoTypes(memos);
        memos = orderBy(memos, m => parseInt(m.height), "desc");
      }
      return memos;
    }
  },
  data: () => ({
    memoTypes: ["post", "repost"],
    memoTypesComment: ["post", "repost", "comment"]
  }),
  methods: {
    filterMemoTypes(memos) {
      let filteredMemos;
      if (this.type === "comment") {
        filteredMemos = pickBy(memos, m =>
          this.memoTypesComment.includes(m.type)
        );
      } else {
        filteredMemos = pickBy(memos, m => this.memoTypes.includes(m.type));
      }
      return filteredMemos;
    },
    combineMemoReposts(memos) {
      let reposts = pickBy(memos, memo => memo.type === "repost");
      let posts;

      if (this.type === "comment") {
        posts = pickBy(
          memos,
          memo => memo.type === "post" || memo.type === "comment"
        );
      } else {
        posts = pickBy(memos, memo => memo.type === "post");
      }

      let hashesOfRepostedMemos = uniq(map(reposts, memo => memo.parent));
      /*
      console.log(
        "combineMemoReposts() hashesOfRepostedMemos",
        hashesOfRepostedMemos
      );
      */

      let combinedMemos = map(posts, post => {
        if (hashesOfRepostedMemos.includes(post.id)) {
          post.timeline = pickBy(reposts, repost => repost.parent === post.id);
          // console.log(post.id, "has been reposted by", post.timeline);
        }
        return post;
      });

      return combinedMemos;
    }
  },
  props: ["memos", "queued", "account", "following", "type"]
};
</script>

<style scoped lang="stylus"></style>
