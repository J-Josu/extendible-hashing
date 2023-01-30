<script lang="ts">
  import Bucket from './Bucket.svelte';
  import type { DirectoryData, DirectoryState } from '../directory';
  import type { Writable } from 'svelte/store';

  export let state: Writable<DirectoryState>;
  export let data: Writable<DirectoryData>;

</script>

<div>
  <p>globalDepth: {$state.globalDepth} | lastBucket: {$state.incrementalId}</p>
  <ol class="buckets">
    <!-- {#each $data as bucket, i (bucket.id)} -->
    {#each $data as bucket, i (bucket.state.value.id)}
      <li>
        <span>{i.toString(2)} {bucket.state.value.id} </span>
        <Bucket state={bucket.state.asStore} data={bucket.data.asStore} />
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
  p, span{
    font-size: 2rem;
    padding-block: 1rem;
  }span {
    padding-inline: 1rem;
    min-width: 6ch;
  }
  ol {
    display: flex;
    flex-direction: column;
    gap:1rem;
  }
  li {
    display: flex;
    border: 1px solid rgb(167, 251, 251);
  }
</style>
