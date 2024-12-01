import {Component} from 'react'
import Cookies from 'js-cookie'
import {MdLocationOn} from 'react-icons/md'
import {AiFillStar} from 'react-icons/ai'
import {BiLinkExternal} from 'react-icons/bi'
import {BsBriefcase} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarJobs from '../SimilarJobs'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'INPROGRESS',
}

class AboutJob extends Component {
  state = {
    jobDataDetails: [],
    similarJobsData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobsData()
  }

  getJobsData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const jobDetailsApiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(jobDetailsApiUrl, options)
    if (response.ok === true) {
      const fetchedJobdata = await response.json()
      const updatedJobdata = [fetchedJobdata.job_details].map(each => ({
        companyLogoUrl: each.company_logo_url,
        companyWebsiteUrl: each.company_website_url,
        employmentType: each.employment_type,
        id: each.id,
        jobDescription: each.job_description,
        lifeAtCompany: {
          description: each.life_at_company.description,
          imageUrl: each.life_at_company.image_url,
        },
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        skills: each.skills.map(eachSkill => ({
          skillImage: eachSkill.image_url,
          name: eachSkill.name,
        })),
        title: each.title,
      }))

      const updatedSimilarJobDetails = fetchedJobdata.similar_jobs.map(
        each => ({
          companyLogoUrl: each.company_logo_url,
          id: each.id,
          jobDescription: each.job_description,
          employmentType: each.employment_type,
          location: each.location,
          rating: each.rating,
          title: each.title,
        }),
      )
      this.setState({
        jobDataDetails: updatedJobdata,
        similarJobsData: updatedSimilarJobDetails,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderJobDetailsSuccessView = () => {
    const {jobDataDetails, similarJobsData} = this.state
    if (jobDataDetails.length > 0) {
      const {
        companyLogoUrl,
        companyWebsiteUrl,
        employmentType,
        id,
        jobDescription,
        lifeAtCompany,
        location,
        packagePerAnnum,
        rating,
        skills,
        title,
      } = jobDataDetails[0]

      return (
        <>
          <div className="job-item-container">
            <div className="first-part-container">
              <div className="img-title-container">
                <img
                  className="company-logo"
                  src={companyLogoUrl}
                  alt="job details company logo"
                />
                <div className="title-rating-container">
                  <h1 className="title-heading">{title}</h1>
                  <div className="star-rating-container">
                    <AiFillStar className="star-icon" />
                    <p className="rating-text">{rating}</p>
                  </div>
                </div>
              </div>
              <div className="location-package-container">
                <div className="location-job-type-container">
                  <div className="location-icon-location-container">
                    <MdLocationOn className="location-icon" />
                    <p className="location">{location}</p>

                    <BsBriefcase className="location-icon" />
                    <p className="job-type">{employmentType}</p>
                  </div>
                  <div>
                    <p className="package">{packagePerAnnum}</p>
                  </div>
                </div>
              </div>
            </div>
            <hr className="item-hr-line" />
            <div className="second-part-container">
              <div className="description-visit-container">
                <h1 className="description-job-heading">Description</h1>
                <a className="visit-anchor" href={companyWebsiteUrl}>
                  Visit <BiLinkExternal />
                </a>
              </div>
              <p className="description-para">{jobDescription}</p>
            </div>
            <h1>Skills</h1>
            <ul className="ul-job-details-container">
              {skills.map(each => (
                <li className="li-job-details-container" key={each.name}>
                  <img
                    className="skill-img"
                    src={each.skillImage}
                    alt={each.name}
                  />
                  <p className="skill">{each.name}</p>
                </li>
              ))}
            </ul>
            <div className="company-life-img-container">
              <div className="life-heading-para-container">
                <h1 className="at-company">Life at Company</h1>
                <p className="company-life">{lifeAtCompany.description}</p>
              </div>
              <img src={lifeAtCompany.imageUrl} alt="life at company" />
            </div>
          </div>
          <h1 className="similar-jobs-heading">Similar Jobs</h1>
          <ul className="similar-jobs-ul-container">
            {similarJobsData.map(each => (
              <SimilarJobs
                key={each.id}
                similarJobData={each}
                employmentType={employmentType}
              />
            ))}
          </ul>
        </>
      )
    }
    return null
  }

  onRetryjobDetails = () => {
    this.getJobsData()
  }

  renderJobFailureView = () => (
    <div className="job-details-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>we cannot seem to find the page you are looking for.</p>
      <div className="btn-container-failure">
        <button
          className="failure-job-details-btn"
          type="button"
          onClick={this.onRetryjobDetails}
        >
          Retry
        </button>
      </div>
    </div>
  )

  renderJobLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobdetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetailsSuccessView()
      case apiStatusConstants.failure:
        return this.renderJobFailureView()
      case apiStatusConstants.inProgress:
        return this.renderJobLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="bg-container">{this.renderJobdetails()}</div>
      </>
    )
  }
}

export default AboutJob
