<script lang="ts">
  import Bucket from './Bucket.svelte';
  import type { DirectoryDataStore, DirectoryStateStore } from './directory';

  export let state: DirectoryStateStore;
  export let data: DirectoryDataStore;
</script>


<div>
  <p>globalDepth: {$state.globalDepth} | lastBucket: {$state.incrementalId}</p>
  <ol class="buckets">
    <!-- {#each $data as bucket, i (bucket.id)} -->
    {#each $data as bucket, i}
      <li>
        <span>{i.toString(2)}</span>
        <Bucket state={bucket.state} data={bucket.data}/>
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
  p {
    font-size: 2rem;
  }
  li {
    display: flex;
  }
</style>
