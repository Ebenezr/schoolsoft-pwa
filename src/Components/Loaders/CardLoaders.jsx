import styles from '../../index.css';
function CardLoader() {
  return (
    <div className='bg-white shadow mt-3 w-full h-72 flex-shrink-0 inline-block grid place-items-center rounded-lg p-3'>
      <div className={`${styles.spinner} rounded-lg h-full w-full`}></div>
    </div>
  );
}
export default CardLoader;
