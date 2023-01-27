<script lang="ts">
  import Bucket from './Bucket.svelte';
  import type { DirectoryDataStore, DirectoryStateStore } from './directory';

  export let state: DirectoryStateStore;
  export let data: DirectoryDataStore;

  $: buckets = [...new Set($data)].sort((a, b) => a.id - b.id);
</script>

<div>
  <h3>Peristant Storage</h3>
  <p>bucketsQuantity: {buckets.length}</p>
  <p>lastRead: {$state.lastRead}</p>
  <ol class="buckets">
    <!-- {#each $data as bucket, i (bucket.id)} -->
    {#each buckets as bucket, i}
      <li>
        <div><span>{i.toString(2)}</span></div>
        <Bucket state={bucket.state} data={bucket.data} />
      </li>
    {/each}
  </ol>
</div>

<style>
  /* div {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  } */
  h3 {
    font-size: 3rem;
  }
  p {
    font-size: 1.8rem;
  }
  ol {
    margin-top: 1rem;
  }
  li {
    display: flex;
  }
</style>
