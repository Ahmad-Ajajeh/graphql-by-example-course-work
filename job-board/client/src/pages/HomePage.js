import { useState } from "react";
import JobList from "../components/JobList";
import { useJobs } from "../lib/graphql/hooks";
import PaginationBar from "../components/PaginationBar";

const JOBS_PER_PAGE = 7;

function HomePage() {
  // const [jobs, setJobs] = useState([]);

  // useEffect(() => {
  //   fetchJobs().then(setJobs);
  // }, [setJobs]);

  const [page, setPage] = useState(1);

  const { jobs } = useJobs(JOBS_PER_PAGE, (page - 1) * JOBS_PER_PAGE);
  const totalPages = Math.ceil(jobs?.total_count / JOBS_PER_PAGE);

  return (
    <div>
      <h1 className="title">Job Board</h1>
      {/* <button disabled={page === 1} onClick={() => setPage((page) => page - 1)}>
        previous page
      </button>
      <span>{`${page} of ${totalPages}`}</span>
      <button
        disabled={page === totalPages}
        onClick={() => setPage((page) => page + 1)}
      >
        next page
      </button> */}
      <PaginationBar
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      <JobList jobs={jobs?.items || []} />
    </div>
  );
}

export default HomePage;
