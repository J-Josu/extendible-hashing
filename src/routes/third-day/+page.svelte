<script lang="ts">
  import Bucket from './Bucket.svelte';
  import Directory from './Directory.svelte';
  import PersistantStorage from './PersistantStorage.svelte';

  const test = { val1: 5, val2: 0 };

  // const addElement = () => {
  //   const val = uniqueValue();
  //   const item = {
  //     id: val,
  //     pow: count ** 2,
  //     texto: `${val}-numerito`,
  //   };
  //   d.insert(
  //     count,
  //     new HashRecord<{ id: number; pow: number; texto: string }>(count, item)
  //   );
  //   count++;
  // };
</script>

<div class="container">
  <div>
    <!-- <button on:click={addElement}>Increment</button> -->
    <!-- <Directory state={d.state} data={d.data} /> -->
  </div>
  <div>
    <!-- <PersistantStorage state={d.state} data={d.data} /> -->
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
