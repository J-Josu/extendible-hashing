<script lang="ts">
  import type { ObjectLiteral } from '$lib/utils/types';
  import type { Writable } from 'svelte/store';
  import type { RecordState, RecordData } from '../record';

  export let state: Writable<RecordState>;
  export let data: Writable<RecordData<ObjectLiteral>>;
</script>

<div>
  <p>{$state.isNew}</p>
  {#each Object.entries($data) as [key, value] (key)}
    <p>{key}: {value}</p>
  {/each}
</div>

<style>
  div {
    background-color: darkslategray;
    border: 1px solid var(--border-color-main);
    max-width: 16rem;
    padding: 0.8rem;
  }
  p {
    font-size: 2rem;
  }
</style>
