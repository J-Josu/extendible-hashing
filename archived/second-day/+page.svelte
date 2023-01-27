<script lang="ts">
  import { uniqueValue } from '$lib/utils/random';
  import { HashBucket } from './bucket';
  import Bucket from './Bucket.svelte';
  import { HashDirectory } from './directory';
  import Directory from './Directory.svelte';
  import PersistantStorage from './PersistantStorage.svelte';
  import { HashRecord } from './record';

  const test = { val1: 5, val2: 0 };

  const r = new HashRecord(1, {
    num: 2,
    num2: 0,
  });

  const b = new HashBucket(0, 3, 1);
  const c = new HashBucket(0, 3, 2);
  c.search(1);

  const d = new HashDirectory(3);
  let count = 0;

  const addElement = () => {
    const val = uniqueValue();
    const item = {
      id: val,
      pow: count ** 2,
      texto: `${val}-numerito`,
    };
    d.insert(
      count,
      new HashRecord<{ id: number; pow: number; texto: string }>(count, item)
    );
    count++;
    // elements = direc tory.buckets;
  };
</script>

<div class="container">
  <div>
    <button on:click={addElement}>Increment</button>
    <!-- <Directory state={d.state} data={d.data} /> -->
  </div>
  <div>
    <PersistantStorage state={d.state} data={d.data} />
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    place-items: center;
    margin-top: 6.4rem;
  }
</style>
