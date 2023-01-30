<script lang="ts">
  import type { PrimitiveObjectLiteral } from '$lib/typescript/utils/types';
  import type { Writable } from 'svelte/store';
  import type { RecordState, RecordData } from '../record';

  export let state: Writable<RecordState>;
  export let data: Writable<RecordData<PrimitiveObjectLiteral>>;
</script>

<div>
  <!-- <p>id?: {$state.hash?.baseValue?.toString(2)}</p> -->
  <p>id?: {$state.id}</p>
  <p>garb?: {$state.isGarbage}</p>
  {#each Object.entries($data) as [key, value] (key)}
    <p>{key}: {value}</p>
  {/each}
</div>

<style>
  div {
    background-color: darkslategray;
    border: 1px solid var(--border-color-main);
    max-width: 18rem;
    padding: 0.8rem;
  }
  p {
    font-size: 2rem;
  }
</style>
