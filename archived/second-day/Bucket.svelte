<script lang="ts">
  import Record from './Record.svelte';
  import type { BucketDataStore, BucketStateStore } from './bucket';

  export let state: BucketStateStore;
  export let data: BucketDataStore;
</script>

<div>
  <p>id: {$state} | depth: {$state.depth}</p>
  <div class="records">
    {#each [...$data] as [hash, record] (hash)}
      <Record state={record.state} data={record.data} />
    {/each}
  </div>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  p {
    font-size: 2rem;
  }
  .records {
    flex-direction: row;
  }
</style>
