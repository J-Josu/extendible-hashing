<script lang="ts">
  import Record from './Record.svelte';
  import type { BucketData, BucketState } from '../bucket';
    import type { Writable } from 'svelte/store';

  export let state: Writable<BucketState>;
  export let data: Writable<BucketData>;
</script>

<div>
  <p>id: {$state.id} | depth: {$state.depth}</p>
  <div class="records">
    {#each [...$data] as [hash, record] (hash)}
      <Record state={record.state.asStore} data={record.data.asStore} />
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
