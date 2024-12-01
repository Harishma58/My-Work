import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {AiOutlineSearch} from 'react-icons/ai'
import Cookies from 'js-cookie'
import JobCardItem from '../JobCardItem'
import Header from '../Header'
import './index.css'

const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

const salaryRangesList = [
  {salaryRangeId: '1000000', label: '10 LPA and above'},
  {salaryRangeId: '2000000', label: '20 LPA and above'},
  {salaryRangeId: '3000000', label: '30 LPA and above'},
  {salaryRangeId: '4000000', label: '40 LPA and above'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAIL',
  inProgress: 'IN PROGRESS',
}

class AllJobs extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    profileData: {},
    jobsData: [],
    apiJobStatus: apiStatusConstants.initial,
    activeCheckBoxList: [],
    activeSalaryRangeId: '',
    searchInput: '',
  }

  componentDidMount() {
    this.getProfileData()
    this.getJobsData()
  }

  getProfileData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const profile = data.profile_details
      const updatedProfileData = {
        name: profile.name,
        profileImageUrl: profile.profile_image_url,
        shortBio: profile.short_bio,
      }
      this.setState({
        profileData: updatedProfileData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  getJobsData = async () => {
    this.setState({apiJobStatus: apiStatusConstants.inProgress})
    const {activeCheckBoxList, activeSalaryRangeId, searchInput} = this.state
    const type = activeCheckBoxList.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs?employment_type=${type}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const filteredJobsList = data.jobs.map(each => ({
        id: each.id,
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))
      this.setState({
        jobsData: filteredJobsList,
        apiJobStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiJobStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearchInput = event =>
    this.setState({searchInput: event.target.value})

  onSubmitSearchInput = () => {
    this.getJobsData()
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getJobsData()
    }
  }

  onSelectSalaryRange = event => {
    this.setState({activeSalaryRangeId: event.target.id}, this.getJobsData)
  }

  onClickCheckbox = event => {
    const {activeCheckBoxList} = this.state
    if (activeCheckBoxList.includes(event.target.id)) {
      const updatedList = activeCheckBoxList.filter(
        each => each !== event.target.id,
      )
      this.setState({activeCheckBoxList: updatedList}, this.getJobsData)
    } else {
      this.setState(
        prevState => ({
          activeCheckBoxList: [
            ...prevState.activeCheckBoxList,
            event.target.id,
          ],
        }),
        this.getJobsData,
      )
    }
  }

  onSuccessProfileView = () => {
    const {profileData} = this.state
    const {name, profileImageUrl, shortBio} = profileData
    return (
      <div className="profile-container">
        <img src={profileImageUrl} className="profile-icon" alt="profile" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-description">{shortBio}</p>
      </div>
    )
  }

  onSuccessJobsView = () => {
    const {jobsData} = this.state
    return jobsData.length > 0 ? (
      <ul className="ul-job-items-container">
        {jobsData.map(each => (
          <JobCardItem key={each.id} item={each} />
        ))}
      </ul>
    ) : (
      <div className="no-jobs-container">
        <img
          className="no-jobs-img"
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
        />
        <h1>No jobs found</h1>
        <p>We could not find any jobs. Try other filters.</p>
      </div>
    )
  }

  onRetryProfile = () => this.getProfileData()

  onRetryJobs = () => this.getJobsData()

  onFailProfileView = () => (
    <div>
      <h1>Profile Fail</h1>
      <button type="button" onClick={this.onRetryProfile}>
        Retry
      </button>
    </div>
  )

  onFailJobsView = () => (
    <div className="failure-img-button-container">
      <img
        className="failure-img"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-paragraph">
        we cannot seem to find the page you are looking for
      </p>
      <button
        className="failure-button"
        type="button"
        onClick={this.onRetryJobs}
      >
        Retry
      </button>
    </div>
  )

  onLoading = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  onGetCheckBoxesView = () => (
    <ul className="check-boxes-container">
      {employmentTypesList.map(each => (
        <li className="li-container" key={each.employmentTypeId}>
          <input
            className="input"
            id={each.employmentTypeId}
            type="checkbox"
            onChange={this.onClickCheckbox}
          />
          <label className="label" htmlFor={each.employmentTypeId}>
            {each.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onGetRadioButtonsView = () => (
    <ul className="radio-button-container">
      {salaryRangesList.map(each => (
        <li className="li-container" key={each.salaryRangeId}>
          <input
            className="radio"
            id={each.salaryRangeId}
            type="radio"
            name="option"
            onChange={this.onSelectSalaryRange}
          />
          <label className="label" htmlFor={each.salaryRangeId}>
            {each.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onRenderProfile = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.onLoading()
      case apiStatusConstants.failure:
        return this.onFailProfileView()
      case apiStatusConstants.success:
        return this.onSuccessProfileView()
      default:
        return null
    }
  }

  onRenderJobs = () => {
    const {apiJobStatus} = this.state
    switch (apiJobStatus) {
      case apiStatusConstants.inProgress:
        return this.onLoading()
      case apiStatusConstants.failure:
        return this.onFailJobsView()
      case apiStatusConstants.success:
        return this.onSuccessJobsView()
      default:
        return null
    }
  }

  onRenderSearch = () => {
    const {searchInput} = this.state
    return (
      <div className="s-bar">
        <input
          className="search-input"
          type="search"
          value={searchInput}
          placeholder="Search"
          onChange={this.onChangeSearchInput}
          onKeyDown={this.onEnterSearchInput}
        />
        <button
          data-testid="searchButton"
          type="button"
          className="search-button"
          onClick={this.onSubmitSearchInput}
        >
          <AiOutlineSearch className="search-icon" />
        </button>
      </div>
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="body-container">
          <div className="side-bar-container">
            {this.onRenderProfile()}
            <hr className="hr-line" />
            <h1 className="text">Type of Employment</h1>
            {this.onGetCheckBoxesView()}
            <hr className="hr-line" />
            <h1 className="text">Salary Range</h1>
            {this.onGetRadioButtonsView()}
          </div>
          <div className="jobs-container">
            <div className="lg-search-container">{this.onRenderSearch()}</div>
            {this.onRenderJobs()}
          </div>
        </div>
      </>
    )
  }
}

export default AllJobs
