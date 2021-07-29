import AdvQueryControls from './query-controls.jsx';
import { AuthorSelect } from './query-controls.jsx';

(function ( wpI18n, wpBlocks, wpElement, wpBlockEditor, wpComponents, wpData, lodash, wpHtmlEntities, wpDate ) {
    wpBlockEditor = wp.blockEditor || wp.editor;
    const { __ } = wpI18n;
    const { Component, Fragment, RawHTML } = wpElement;
    const { registerBlockType } = wpBlocks;
    const { InspectorControls, BlockControls } = wpBlockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, FormTokenField, Spinner, ToolbarGroup, ToolbarButton, Placeholder, Tooltip, SelectControl } = wpComponents;
    const { withSelect } = wpData;
    const { pickBy, isUndefined, isArray, isNull, uniqWith, isEqual, omit, union, sortBy, unset, set, find } = lodash;
    const { decodeEntities } = wpHtmlEntities;
    const { dateI18n } = wpDate;

    const advRecentPostsBlockIcon = (
        <svg width="20" height="20" viewBox="2 2 22 22">
            <path fill="none" d="M0,0h24v24H0V0z"/>
            <rect x="13" y="7.5" width="5" height="2"/>
            <rect x="13" y="14.5" width="5" height="2"/>
            <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z"/>
            <path d="M11,6H6v5h5V6z M10,10H7V7h3V10z"/>
            <path d="M11,13H6v5h5V13z M10,17H7v-3h3V17z"/>
        </svg>
    );

    const INBUILT_POST_TYPES = [ 'page', 'post' ];

    const MAX_CATEGORIES_SUGGESTIONS = 20;

    const previewImageData = 'data:image/png;base64,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';

    const FRONTPAGE_LAYOUTS = [
        { layout: '1-2', icon: '1-2', title: __( 'The leading post on top, the rest in 2 columns below', 'advanced-gutenberg' ) },
        { layout: '1-3', icon: '1-3', title: __( 'The leading post on top, the rest in 3 columns below', 'advanced-gutenberg' ) },
        { layout: '1-4', icon: '1-4', title: __( 'The leading post on top, the rest in 4 columns below', 'advanced-gutenberg' ) },
        { layout: '1-5', icon: '1-5', title: __( 'The leading post on top, the rest in 5 columns below', 'advanced-gutenberg' ) },
        { layout: 'stacked', icon: 'stacked', title: __( 'Stacked', 'advanced-gutenberg' ) },
        { layout: '2-2', icon: '2-2', title: __( 'All posts in 2 columns grid', 'advanced-gutenberg' ) },
        { layout: '3-3', icon: '3-3', title: __( 'All posts in 3 columns grid', 'advanced-gutenberg' ) },
        { layout: '4-4', icon: '4-4', title: __( 'All posts in 4 columns grid', 'advanced-gutenberg' ) },
        { layout: '5-5', icon: '5-5', title: __( 'All posts in 5 columns grid', 'advanced-gutenberg' ) },
    ];

    // @TODO fix duplicated code from FRONTPAGE_LAYOUTS
    const FRONTPAGE_LAYOUTS_TABLET = [
        { layout: '1-2', icon: '1-2', title: __( 'The leading post on top, the rest in 2 columns below', 'advanced-gutenberg' ) },
        { layout: '1-3', icon: '1-3', title: __( 'The leading post on top, the rest in 3 columns below', 'advanced-gutenberg' ) },
        { layout: '1-4', icon: '1-4', title: __( 'The leading post on top, the rest in 4 columns below', 'advanced-gutenberg' ) },
        { layout: '1-5', icon: '1-5', title: __( 'The leading post on top, the rest in 5 columns below', 'advanced-gutenberg' ) },
        { layout: 'stacked', icon: 'stacked', title: __( 'Stacked', 'advanced-gutenberg' ) },
        { layout: '2-2', icon: '2-2', title: __( 'All posts in 2 columns grid', 'advanced-gutenberg' ) },
        { layout: '3-3', icon: '3-3', title: __( 'All posts in 3 columns grid', 'advanced-gutenberg' ) },
        { layout: '4-4', icon: '4-4', title: __( 'All posts in 4 columns grid', 'advanced-gutenberg' ) },
        { layout: '5-5', icon: '5-5', title: __( 'All posts in 5 columns grid', 'advanced-gutenberg' ) },
    ];

    const FRONTPAGE_LAYOUTS_MOBILE = [
        { layout: '1-2', icon: '1-2', title: __( 'The leading post on top, the rest in 2 columns below', 'advanced-gutenberg' ) },
        { layout: 'stacked', icon: 'stacked', title: __( 'Stacked', 'advanced-gutenberg' ) },
        { layout: '2-2', icon: '2-2', title: __( 'All posts in 2 columns grid', 'advanced-gutenberg' ) },
    ];

    const GAP_OPTIONS = [
        { label: __( 'None', 'advanced-gutenberg' ), value: 0},
        { label: '5px', value: 5 },
        { label: '10px', value: 10 },
        { label: '20px', value: 20 },
        { label: '30px', value: 30 },
        { label: '40px', value: 40 },
        { label: '50px', value: 50 },
    ];

    const NEWSPAPER_LAYOUTS = [
        { layout: 'np-1-1', icon: 'np-1-1', items: 2, title: __( 'The leading post in the left, 1 post in the right', 'advanced-gutenberg' ) },
        { layout: 'np-1-2', icon: 'np-1-2', items: 3, title: __( 'The leading post in the left, 2 posts in the right', 'advanced-gutenberg' ) },
        { layout: 'np-1-3', icon: 'np-1-3', items: 4, title: __( 'The leading post in the left, 3 posts in the right', 'advanced-gutenberg' ) },
        { layout: 'np-1-4', icon: 'np-1-4', items: 5, title: __( 'The leading post in the left, 4 posts in the right', 'advanced-gutenberg' ) },
        { layout: 'np-1-5', icon: 'np-1-5', items: 6, title: __( 'The leading post in the left, 5 posts in the right', 'advanced-gutenberg' ) },
        { layout: 'np-1-1-r', icon: 'np-1-1-r', items: 2, title: __( 'The leading post in the right, 1 post in the left', 'advanced-gutenberg' ) },
        { layout: 'np-1-2-r', icon: 'np-1-2-r', items: 3, title: __( 'The leading post in the right, 2 posts in the left', 'advanced-gutenberg' ) },
        { layout: 'np-1-3-r', icon: 'np-1-3-r', items: 4, title: __( 'The leading post in the right, 3 posts in the left', 'advanced-gutenberg' ) },
        { layout: 'np-1-4-r', icon: 'np-1-4-r', items: 5, title: __( 'The leading post in the right, 4 posts in the left', 'advanced-gutenberg' ) },
        { layout: 'np-1-5-r', icon: 'np-1-5-r', items: 6, title: __( 'The leading post in the right, 5 posts in the left', 'advanced-gutenberg' ) },
        { layout: 'np-2', icon: 'np-2', items: 3, title: __( 'The leading post on top, the rest of posts below', 'advanced-gutenberg' ) },
        { layout: 'np-3-1', icon: 'np-3-1', items: 3, title: __( 'The leading post on top, below 2 columns with 1 post in the left and 1 post in the right', 'advanced-gutenberg' ) },
        { layout: 'np-3-2', icon: 'np-3-2', items: 4, title: __( 'The leading post on top, below 2 columns with 1 post in the left and 2 posts in the right', 'advanced-gutenberg' ) },
        { layout: 'np-3-3', icon: 'np-3-3', items: 5, title: __( 'The leading post on top, below 2 columns with 1 post in the left and 3 posts in the right', 'advanced-gutenberg' ) },
    ];

    const CUSTOM_TAX_PREFIX = 'custom-tax-';

    let initSlider = null;

    class RecentPostsEdit extends Component {
        constructor() {
            super( ...arguments );

            this.state = {
                categoriesList: [],
                tagsList: [],
                catIdVsName: [],
                tagNameVsId: [],
                postTypeList: [],
                updating: false,
                tabSelected: 'desktop',
                updatePostSuggestions: true,
                authorList: [],
            }

            this.selectCategories = this.selectCategories.bind(this);
            this.selectTags = this.selectTags.bind(this);
            this.getTagIdsForTags = this.getTagIdsForTags.bind(this);
            this.getCategoryForBkwrdCompat = this.getCategoryForBkwrdCompat.bind(this);
            this.selectPostByTitle = this.selectPostByTitle.bind(this);
            this.updatePostType = this.updatePostType.bind(this);
        }

        componentWillMount() {
            const { attributes, setAttributes } = this.props;
            const currentBlockConfig = advgbDefaultConfig['advgb-recent-posts'];

            const tagsAndcategoriesListQuery = {
                per_page: -1,
                hide_empty: true,
            };

            // No override attributes of blocks inserted before
            if (attributes.changed !== true) {
                if (typeof currentBlockConfig === 'object' && currentBlockConfig !== null) {
                    Object.keys(currentBlockConfig).map((attribute) => {
                        if (typeof attributes[attribute] === 'boolean') {
                            attributes[attribute] = !!currentBlockConfig[attribute];
                        } else {
                            attributes[attribute] = currentBlockConfig[attribute];
                        }
                    });
                }

                // Finally set changed attribute to true, so we don't modify anything again
                setAttributes( { changed: true } );
            }

            wp.apiFetch( {
                path: wp.url.addQueryArgs( 'advgb/v1/exclude_post_types' ),
            } ).then( ( excludePostTypes ) => {
                wp.apiFetch( {
                    path: wp.url.addQueryArgs( 'wp/v2/types', { context: 'edit' } ),
                } ).then( ( list ) => {
                    let types = [];
                    Object.keys(list).forEach(type => {
                        if(list[ type ].viewable && ! excludePostTypes.includes( type ) ){
                            types.push( {label: list[ type ].name, value: list[ type ].slug } );
                        }
                    });
                    this.setState( { postTypeList: types } );
                } );
            } );

            wp.apiFetch( {
                path: wp.url.addQueryArgs( 'wp/v2/categories', tagsAndcategoriesListQuery ),
            } ).then( ( list ) => {
                let suggestions = [];
                let catIdVsName = [];
                list.forEach(cat => {
                    suggestions[ cat.name ] = cat;
                    catIdVsName[ cat.id ] = cat.name;
                });
                this.setState( { categoriesList: suggestions, catIdVsName: catIdVsName } );

                // for backward compatibility, extract the (single select) category and set it as the (mutli select) categories
                // and make the (single select) category empty
                const categories = attributes.category && attributes.category !== undefined && attributes.category.length > 0 ? [ this.getCategoryForBkwrdCompat( attributes.category ) ] : attributes.categories;
                setAttributes({
                      categories: categories,
                      category: ''
                });
            } );

            wp.apiFetch( {
                path: wp.url.addQueryArgs( 'wp/v2/tags', tagsAndcategoriesListQuery ),
            } ).then( ( list ) => {
                let suggestions = [];
                let tagNameVsId = [];
                list.forEach(tag => {
                    suggestions.push(tag.name);
                    tagNameVsId[ tag.name ] = tag.id;
                });

                this.setState( { tagsList: suggestions, tagNameVsId: tagNameVsId } );

                const tagIds = attributes.tags && attributes.tags.length > 0 ? this.getTagIdsForTags( attributes.tags ) : [];
                setAttributes({
                      tagIds: tagIds,
                });

            } );

            wp.apiFetch( {
                path: wp.url.addQueryArgs( 'advgb/v1/authors' ),
            } ).then( ( list ) => {
                this.setState( { authorList: list } );
            } );

            // migrate from displayDate to postDate
            let postDateDisplay = attributes.displayDate ? 'created' : attributes.postDate;
            setAttributes({
                  postDate: postDateDisplay,
                  displayDate: false,
            });

            if( ! INBUILT_POST_TYPES.includes( attributes.postType ) ){
                this.generateTaxTerms( attributes.postType );
            }

        }

        componentWillUpdate( nextProps ) {
            const { recentPosts: nextPosts } = nextProps;
            const { postView: nextView } = nextProps.attributes;
            const { attributes, clientId, recentPosts } = this.props;
            const $ = jQuery;

            if (nextView !== 'slider' || (nextPosts && recentPosts && nextPosts.length !== recentPosts.length) ) {
                $(`#block-${clientId} .advgb-recent-posts.slick-initialized`).slick('unslick');
                $(`#block-${clientId} .advgb-recent-post`)
                    .removeAttr('tabindex')
                    .removeAttr('role')
                    .removeAttr('aria-describedby');

                if (nextView === 'slider' && (nextPosts && recentPosts && nextPosts.length !== recentPosts.length)) {
                    if (!this.state.updating) {
                        this.setState( { updating: true } );
                    }
                }

                if (initSlider) {
                    clearTimeout(initSlider);
                }
            }

        }

        componentDidUpdate( prevProps ) {
            const that = this;
            const { attributes, clientId, postList } = this.props;
            const { postView, updatePostSuggestions, sliderAutoplay } = attributes;
            const $ = jQuery;

            if (postView === 'slider') {
                initSlider = setTimeout(function () {
                    $(`#block-${clientId} .advgb-recent-posts-block.slider-view .advgb-recent-posts:not(.slick-initialized)`).slick( {
                        dots: true,
                        adaptiveHeight: true,
                        autoplay: sliderAutoplay,
                    } );

                    $(`#block-${clientId} .advgb-recent-posts-block.slider-view .advgb-recent-posts.slick-initialized`).slick('slickSetOption', 'autoplay', sliderAutoplay, true);

                    if (that.state.updating) {
                        that.setState( { updating: false } );
                    }
                }, 100 );
            } else {
                $(`#block-${clientId} .advgb-recent-posts.slick-initialized`).slick('unslick');
            }

            if (postView === 'masonry') {
                var $masonry = $(`#block-${clientId} .masonry-view .advgb-recent-posts`);
                $masonry.isotope({
                    itemSelector: '.advgb-recent-post',
                    percentPosition: true
                });
                $(window).resize(function(){
                    $masonry.isotope();
                });
            } else {
                var $masonry = $(`#block-${clientId} .advgb-recent-posts`);
                $masonry.isotope();
                $masonry.isotope('destroy');
            }

            // this.state.updatePostSuggestions: corresponds to componentDidMount
            if(postList && (updatePostSuggestions || this.state.updatePostSuggestions)){
                let postSuggestions = [];
                let postTitleVsIdMap = [];
                postList.forEach( post => {
                    postSuggestions.push(post.title.raw);
                    postTitleVsIdMap[ post.title.raw ] = post.id;
                });
                this.props.setAttributes( { updatePostSuggestions: false } );
                this.setState( { postSuggestions: postSuggestions, postTitleVsIdMap: postTitleVsIdMap, updatePostSuggestions: false }, function(){
                    // the saved attribute will be called 'include'/'exclude' and contain post titles
                    // we have to convert them into post Ids when the component is loaded the first time
                    if(!attributes.excludeIds && attributes.exclude){
                        this.selectPostByTitle( attributes.exclude, 'exclude' );
                    }
                });
            }

        }

        render() {
            const { categoriesList, tagsList, postTypeList, tabSelected, authorList, postSuggestions, taxonomyList } = this.state;
            const { attributes, setAttributes, recentPosts: recentPostsList } = this.props;
            const {
                postView,
                order,
                orderBy,
                numberOfPosts,
                columns,
                columnsT,
                columnsM,
                displayFeaturedImage,
                displayFeaturedImageFor,
                displayFeaturedImageCaption,
                enablePlaceholderImage,
                displayAuthor,
                displayDate,
                postDate,
                postDateFormat,
                displayTime,
                displayExcerpt,
                postTextAsExcerpt,
                postTextExcerptLength,
                displayReadMore,
                readMoreLbl,
                isPreview,
                categories,
                tags,
                frontpageLayout, frontpageLayoutT, frontpageLayoutM,
                gap,
                frontpageStyle,
                sliderStyle,
                newspaperLayout,
                excludeCurrentPost,
                showCategories,
                showTags,
                displayCommentCount,
                textAfterTitle,
                textBeforeReadmore,
                exclude,
                author: selectedAuthorId,
                sliderAutoplay,
                linkCustomTax,
                showCustomTaxList,
                imagePosition,
                onlyFromCurrentUser,
            } = attributes;

            let recentPosts = this.props.recentPosts;

            const isInPost = wp.data.select('core/editor').getCurrentPostType() === 'post';

            let postType = attributes.postType;
            if(postType === undefined){
                postType = 'post';
            }

            let deviceLetter = '';
            if (tabSelected === 'tablet') deviceLetter = 'T';
            if (tabSelected === 'mobile') deviceLetter = 'M';

            const inspectorControls = (
                <InspectorControls>
                    {postView === 'slider' &&
                    <PanelBody title={ __( 'Slider View Settings', 'advanced-gutenberg' ) }>
                        <SelectControl
                            label={ __( 'Style', 'advanced-gutenberg' ) }
                            value={ sliderStyle }
                            options={ [
                                { label: __( 'Default', 'advanced-gutenberg' ), value: 'default' },
                                { label: __( 'Headline', 'advanced-gutenberg' ), value: 'headline' },
                            ] }
                            onChange={ ( value ) => setAttributes( { sliderStyle: value } ) }
                        />
                        <ToggleControl
                            label={ __( 'Autoplay', 'advanced-gutenberg' ) }
                            checked={ sliderAutoplay }
                            onChange={ () => setAttributes( { sliderAutoplay: !sliderAutoplay } ) }
                        />
                    </PanelBody>
                    }
                    {postView === 'frontpage' &&
                    <PanelBody title={ __( 'Frontpage View Settings', 'advanced-gutenberg' ) }>
                        <div className="advgb-recent-posts-responsive-items">
                            {['desktop', 'tablet', 'mobile'].map( (device, index) => {
                                const itemClasses = [
                                    "advgb-recent-posts-responsive-item",
                                    tabSelected === device && 'is-selected',
                                ].filter( Boolean ).join( ' ' );

                                return (
                                    <div className={ itemClasses }
                                         key={ index }
                                         onClick={ () => this.setState( { tabSelected: device } ) }
                                    >
                                        {device}
                                    </div>
                                )
                            } ) }
                        </div>
                        <div className="advgb-recent-posts-select-layout on-inspector">
                            {tabSelected === 'desktop' && FRONTPAGE_LAYOUTS.map( (layout, index) => {
                                const layoutClasses = [
                                    'advgb-recent-posts-layout',
                                    tabSelected === 'desktop' && layout.layout === frontpageLayout && 'is-selected',
                                ].filter( Boolean ).join( ' ' );

                                return (
                                    <Tooltip text={ layout.title } key={ index }>
                                        <div
                                            className={ layoutClasses }
                                            onClick={ () => {
                                                setAttributes( {
                                                    ['frontpageLayout' + deviceLetter]: layout.layout
                                                } );
                                                this.setState( { random: Math.random() } );
                                            } }
                                        >
                                            <img src={advgbBlocks.pluginUrl + '/assets/blocks/recent-posts/icons/' + layout.icon + '.png'}
                                                 alt={ layout.layout }
                                            />
                                        </div>
                                    </Tooltip>
                                )
                            } ) }
                            {tabSelected === 'tablet' && FRONTPAGE_LAYOUTS_TABLET.map( (layout, index) => {
                                const layoutClasses = [
                                    'advgb-recent-posts-layout',
                                    tabSelected === 'tablet' && layout.layout === frontpageLayoutT && 'is-selected',
                                ].filter( Boolean ).join( ' ' );

                                return (
                                    <Tooltip text={ layout.title } key={ index }>
                                        <div className={ layoutClasses }
                                             onClick={ () => {
                                                 setAttributes( {
                                                     ['frontpageLayout' + deviceLetter]: layout.layout
                                                 } );
                                                 this.setState( { random: Math.random() } );
                                             } }
                                        >
                                            <img src={advgbBlocks.pluginUrl + '/assets/blocks/recent-posts/icons/' + layout.icon + '.png'}
                                                 alt={ layout.layout }
                                            />
                                        </div>
                                    </Tooltip>
                                )
                            } ) }
                            {tabSelected === 'mobile' && FRONTPAGE_LAYOUTS_MOBILE.map( (layout, index) => {
                                const layoutClasses = [
                                    'advgb-recent-posts-layout',
                                    tabSelected === 'mobile' && layout.layout === frontpageLayoutM && 'is-selected',
                                ].filter( Boolean ).join( ' ' );

                                return (
                                    <Tooltip text={ layout.title } key={ index }>
                                        <div className={ layoutClasses }
                                             onClick={ () => {
                                                 setAttributes( {
                                                     ['frontpageLayout' + deviceLetter]: layout.layout
                                                 } );
                                                 this.setState( { random: Math.random() } );
                                             } }
                                        >
                                            <img src={advgbBlocks.pluginUrl + '/assets/blocks/recent-posts/icons/' + layout.icon + '.png'}
                                                 alt={ layout.layout }
                                            />
                                        </div>
                                    </Tooltip>
                                )
                            } ) }
                        </div>
                        <SelectControl
                            label={ __( 'Style', 'advanced-gutenberg' ) }
                            value={ frontpageStyle }
                            options={ [
                                { label: __( 'Default', 'advanced-gutenberg' ), value: 'default' },
                                { label: __( 'Headline', 'advanced-gutenberg' ), value: 'headline' },
                                { label: __( 'Boxed', 'advanced-gutenberg' ), value: 'boxed' },
                            ] }
                            onChange={ ( value ) => setAttributes( { frontpageStyle: value } ) }
                        />
                        <SelectControl
                            label={ __( 'Space between columns and rows', 'advanced-gutenberg' ) }
                            value={ gap }
                            options={ GAP_OPTIONS }
                            onChange={ (value) => setAttributes( { gap: parseInt(value) } ) }
                        />
                    </PanelBody>
                    }

                    {postView === 'newspaper' &&
                    <PanelBody title={ __( 'Newspaper View Settings', 'advanced-gutenberg' ) }>
                        <div className="advgb-recent-posts-select-layout on-inspector">
                            {NEWSPAPER_LAYOUTS.map( (layout, index) => {
                                const layoutClasses = [
                                    'advgb-recent-posts-layout',
                                    layout.layout === newspaperLayout && 'is-selected',
                                ].filter( Boolean ).join( ' ' );

                                return (
                                    <Tooltip text={ layout.title } key={ index }>
                                        <div
                                            className={ layoutClasses }
                                            onClick={ () => {
                                                setAttributes( {
                                                    newspaperLayout: layout.layout
                                                } );
                                                this.setState( { random: Math.random() } );
                                                this.newspaperOnChangeLayout(layout.layout);
                                            } }
                                        >
                                            <img src={advgbBlocks.pluginUrl + '/assets/blocks/recent-posts/icons/' + layout.icon + '.png'}
                                                 alt={ layout.layout }
                                            />
                                        </div>
                                    </Tooltip>
                                )
                            } ) }
                        </div>
                    </PanelBody>
                    }

                    {postView === 'masonry' &&
                    <PanelBody title={ __( 'Masonry View Settings', 'advanced-gutenberg' ) }>
                        <SelectControl
                            label={ __( 'Space between columns and rows', 'advanced-gutenberg' ) }
                            value={ gap }
                            options={ GAP_OPTIONS }
                            onChange={ (value) => setAttributes( { gap: parseInt(value) } ) }
                        />
                    </PanelBody>
                    }
                    <PanelBody title={ __( 'Post Settings', 'advanced-gutenberg' ) }>
                        <SelectControl
                            label={ __( 'Post Type', 'advanced-gutenberg' ) }
                            value={ postType }
                            options={ postTypeList }
                            onChange={ (value) => this.updatePostType(value) }
                        />
                        <AdvQueryControls
                            { ...{ order, orderBy, postType } }
                            numberOfItems={ numberOfPosts }
                            onOrderChange={ ( value ) => setAttributes( { order: value } ) }
                            onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
                            onNumberOfItemsChange={ (value) => this.refreshOnChangeItems(value) }
                        />
                    </PanelBody>
                    <PanelBody title={ __( 'Filters', 'advanced-gutenberg' ) }>
                        { postType === 'post' &&
                            <Fragment>
                                <FormTokenField
                                    key="query-controls-categories-select"
                                    label={__('Show content with these Categories', 'advanced-gutenberg')}
                                    value={
                                        categories &&
                                        categories.map((item) => ({
                                            id: item.id,
                                            value: item.name || item.value,
                                        }))
                                    }
                                    suggestions={Object.keys(categoriesList)}
                                    onChange={ ( value ) => { this.selectCategories(value); } }
                                    maxSuggestions={ MAX_CATEGORIES_SUGGESTIONS }
                                />
                                <FormTokenField
                                    multiple
                                    suggestions={ tagsList }
                                    value={ tags }
                                    label={ __( 'Show content with these Tags', 'advanced-gutenberg' ) }
                                    placeholder={ __( 'Type a tag', 'advanced-gutenberg' ) }
                                    onChange={ ( value ) => {
                                                        this.selectTags(value);
                                                    }
                                    }
                                />
                            </Fragment>
                        }
                        { taxonomyList && taxonomyList.length > 0 &&
                            taxonomyList.map( (tax) =>
                                (
                                    <FormTokenField
                                        multiple
                                        suggestions={ tax.suggestions }
                                        value={ this.populateTaxTerms( tax ) }
                                        onChange={ (value) => this.selectTaxTerms( tax, value ) }
                                        key="query-controls-`${tax.slug}`-select"
                                        label={__('Show content with these ', 'advanced-gutenberg') + decodeEntities(`${tax.name}`)}
                                    />
                                )
                            )
                        }
                        { !onlyFromCurrentUser &&
                        <AuthorSelect
                            key="query-controls-author-select"
                            authorList={authorList}
                            label={__('Author', 'advanced-gutenberg')}
                            noOptionLabel={__('All', 'advanced-gutenberg')}
                            selectedAuthorId={selectedAuthorId}
                            onChange={ ( value ) => setAttributes( { author: value } ) }
                        />
                        }
                        <ToggleControl
                            label={ __( 'Only shows posts written by the user viewing the block', 'advanced-gutenberg' ) }
                            checked={ onlyFromCurrentUser }
                            onChange={ () => setAttributes( { onlyFromCurrentUser: !onlyFromCurrentUser } ) }
                        />
                        {isInPost && postType === 'post' &&
                        <ToggleControl
                            label={ __( 'Exclude current post', 'advanced-gutenberg' ) }
                            help={ __( 'If this post is listed in the block, you can exclude it.', 'advanced-gutenberg' ) }
                            checked={ excludeCurrentPost }
                            onChange={ () => setAttributes( { excludeCurrentPost: !excludeCurrentPost } ) }
                        />
                        }
                        <FormTokenField
                            multiple
                            suggestions={ postSuggestions }
                            value={ exclude }
                            label={ __( 'Exclude these posts', 'advanced-gutenberg' ) }
                            placeholder={ __( 'Search by title', 'advanced-gutenberg' ) }
                            onChange={ ( value ) => this.selectPostByTitle( value, 'exclude') }
                        />
                    </PanelBody>

                    <PanelBody title={ __( 'Display Settings', 'advanced-gutenberg' ) }>
                        { ( ( postView === 'grid' ) || ( postView === 'masonry' ) ) &&
                        <RangeControl
                            label={ __( 'Columns', 'advanced-gutenberg' ) }
                            value={ columns }
                            min={ 1 }
                            max={ 4 }
                            onChange={ (value) => setAttributes( { columns: value } ) }
                        />
                        }
                        { postView === 'masonry' &&
                        <Fragment>
                            <RangeControl
                                label={ __( 'Columns (Tablet)', 'advanced-gutenberg' ) }
                                value={ columnsT }
                                min={ 1 }
                                max={ 4 }
                                onChange={ (value) => setAttributes( { columnsT: value } ) }
                            />
                            <RangeControl
                                label={ __( 'Columns (Mobile)', 'advanced-gutenberg' ) }
                                value={ columnsM }
                                min={ 1 }
                                max={ 4 }
                                onChange={ (value) => setAttributes( { columnsM: value } ) }
                            />
                        </Fragment>
                        }
                        <ToggleControl
                            label={ __( 'Display Featured Image', 'advanced-gutenberg' ) }
                            checked={ displayFeaturedImage }
                            onChange={ () => setAttributes( { displayFeaturedImage: !displayFeaturedImage } ) }
                        />
                        {displayFeaturedImage &&
                        <Fragment>
                            <SelectControl
                                value={ displayFeaturedImageFor }
                                options={ [
                                    { label: __( 'For all posts', 'advanced-gutenberg' ), value: 'all' },
                                    { label: __( 'For the first post', 'advanced-gutenberg' ), value: 1 },
                                    { label: __( 'For the first 2 posts', 'advanced-gutenberg' ), value: 2 },
                                    { label: __( 'For the first 3 posts', 'advanced-gutenberg' ), value: 3 },
                                    { label: __( 'For the first 4 posts', 'advanced-gutenberg' ), value: 4 },
                                    { label: __( 'For the first 5 posts', 'advanced-gutenberg' ), value: 5 },
                                ] }
                                onChange={ ( value ) => { setAttributes( { displayFeaturedImageFor: value } ) } }
                                className="advgb-child-select"
                            />
                            <ToggleControl
                                label={ __( 'Enable Placeholder Image', 'advanced-gutenberg' ) }
                                checked={ enablePlaceholderImage }
                                onChange={ () => setAttributes( { enablePlaceholderImage: !enablePlaceholderImage } ) }
                                className="advgb-child-toggle"
                                help={ __( 'If a post doesn\'t have a featured image, the placeholder image will be displayed instead', 'advanced-gutenberg' ) }
                            />
                            {postView === 'list' &&
                            <SelectControl
                                label={ __( 'Position', 'advanced-gutenberg' ) }
                                value={ imagePosition }
                                options={ [
                                    { label: __( 'Left', 'advanced-gutenberg' ), value: 'left' },
                                    { label: __( 'Right', 'advanced-gutenberg' ), value: 'right' },
                                ] }
                                onChange={ ( value ) => setAttributes( { imagePosition: value } ) }
                                className="advgb-child-select"
                            />
                            }
                            <ToggleControl
                                label={ __( 'Display Caption', 'advanced-gutenberg' ) }
                                checked={ displayFeaturedImageCaption }
                                onChange={ () => setAttributes( { displayFeaturedImageCaption: !displayFeaturedImageCaption } ) }
                                className="advgb-child-toggle"
                            />
                        </Fragment>
                        }
                        <ToggleControl
                            label={ __( 'Display Post Author', 'advanced-gutenberg' ) }
                            checked={ displayAuthor }
                            onChange={ () => setAttributes( { displayAuthor: !displayAuthor } ) }
                        />
                        <SelectControl
                            label={ __( 'Display Post Date', 'advanced-gutenberg' ) }
                            value={ postDate }
                            options={ [
                                { label: __( 'Hide', 'advanced-gutenberg' ), value: 'hide' },
                                { label: __( 'Created Date', 'advanced-gutenberg' ), value: 'created' },
                                { label: __( 'Updated Date', 'advanced-gutenberg' ), value: 'updated' },
                            ] }
                            onChange={ ( value ) => { setAttributes( { postDate: value } ) } }
                        />
                        { postDate !== 'hide' &&
                            <Fragment>
                                <SelectControl
                                    label={ __( 'Post Date Format', 'advanced-gutenberg' ) }
                                    value={ postDateFormat }
                                    options={ [
                                        { label: __( 'Absolute', 'advanced-gutenberg' ), value: 'absolute' },
                                        { label: __( 'Relative', 'advanced-gutenberg' ), value: 'relative' },
                                    ] }
                                    onChange={ ( value ) => { setAttributes( { postDateFormat: value } ) } }
                                />
                            {postDateFormat === 'absolute' &&
                                <ToggleControl
                                    label={ __( 'Display Post Time', 'advanced-gutenberg' ) }
                                    checked={ displayTime }
                                    onChange={ () => setAttributes( { displayTime: !displayTime } ) }
                                />
                            }
                            </Fragment>
                        }
                        {postType === 'post' &&
                        <ToggleControl
                            label={ __( 'Display Comment Counts', 'advanced-gutenberg' ) }
                            checked={ displayCommentCount }
                            onChange={ () => setAttributes( { displayCommentCount: !displayCommentCount } ) }
                        />
                        }
                        { postType === 'post' &&
                            <Fragment>
                                <SelectControl
                                    label={ __( 'Display Category', 'advanced-gutenberg' ) }
                                    value={ showCategories }
                                    options={ [
                                        { label: __( 'Hide', 'advanced-gutenberg' ), value: 'hide' },
                                        { label: __( 'Show', 'advanced-gutenberg' ), value: 'show' },
                                        { label: __( 'Show & Link', 'advanced-gutenberg' ), value: 'link' },
                                    ] }
                                    onChange={ ( value ) => { setAttributes( { showCategories: value } ) } }
                                />
                                <SelectControl
                                    label={ __( 'Display Tags', 'advanced-gutenberg' ) }
                                    value={ showTags }
                                    options={ [
                                        { label: __( 'Hide', 'advanced-gutenberg' ), value: 'hide' },
                                        { label: __( 'Show', 'advanced-gutenberg' ), value: 'show' },
                                        { label: __( 'Show & Link', 'advanced-gutenberg' ), value: 'link' },
                                    ] }
                                    onChange={ ( value ) => { setAttributes( { showTags: value } ) } }
                                />
                            </Fragment>
                        }
                        { ! INBUILT_POST_TYPES.includes(postType) && taxonomyList && taxonomyList.length > 0 &&
                            <Fragment>
                                <FormTokenField
                                    multiple
                                    suggestions={ taxonomyList && taxonomyList.length > 0 && taxonomyList.map( (tax) => decodeEntities(tax.name) ) }
                                    value={ showCustomTaxList }
                                    label={ __( 'Display these taxonomies', 'advanced-gutenberg' ) }
                                    onChange={ ( value ) => { this.selectTaxonomies(value); } }
                                />
                                <ToggleControl
                                    label={ __( 'Link above taxonomies', 'advanced-gutenberg' ) }
                                    checked={ linkCustomTax }
                                    onChange={ () => setAttributes( { linkCustomTax: !linkCustomTax } ) }
                                />
                            </Fragment>

                        }
                        <ToggleControl
                            label={ __( 'Display Read More Link', 'advanced-gutenberg' ) }
                            checked={ displayReadMore }
                            onChange={ () => setAttributes( { displayReadMore: !displayReadMore } ) }
                        />
                        {displayReadMore &&
                        <TextControl
                            label={ __('Read more text', 'advanced-gutenberg') }
                            value={ readMoreLbl }
                            onChange={ (value) => setAttributes( { readMoreLbl: value } ) }
                        />
                        }
                        <ToggleControl
                            label={ __( 'Display Post Excerpt', 'advanced-gutenberg' ) }
                            checked={ displayExcerpt }
                            onChange={ () => setAttributes( { displayExcerpt: !displayExcerpt } ) }
                        />
                        {displayExcerpt &&
                        <ToggleControl
                            label={ __( 'First Post text as Excerpt', 'advanced-gutenberg' ) }
                            help={ __( 'Display some part of first text found in post as excerpt.', 'advanced-gutenberg' ) }
                            checked={ postTextAsExcerpt }
                            onChange={ () => setAttributes( { postTextAsExcerpt: !postTextAsExcerpt } ) }
                        />
                        }
                        {displayExcerpt && postTextAsExcerpt &&
                        <RangeControl
                            label={ __( 'Post Text Excerpt length', 'advanced-gutenberg' ) }
                            min={ 50 }
                            max={ 300 }
                            value={ postTextExcerptLength }
                            onChange={ ( value ) => setAttributes( { postTextExcerptLength: value } ) }
                        />
                        }
                        <TextareaControl
                            label={ __( 'Text after title', 'advanced-gutenberg' ) }
                            help={ __( 'Include text/HTML after title', 'advanced-gutenberg' ) }
                            value={ textAfterTitle }
                            onChange={ ( value ) => setAttributes( { textAfterTitle: value } ) }
                        />
                        <TextareaControl
                            label={ __( 'Text before read more', 'advanced-gutenberg' ) }
                            help={ __( 'Include text/HTML before read more', 'advanced-gutenberg' ) }
                            value={ textBeforeReadmore }
                            onChange={ ( value ) => setAttributes( { textBeforeReadmore: value } ) }
                        />
                    </PanelBody>
                </InspectorControls>
            );

            const hasPosts = Array.isArray( recentPosts ) && recentPosts.length;
            console.log(hasPosts);

            // If no posts found we show this notice
            if (!hasPosts) {
                return (
                    isPreview ?
                        <img alt={__('Content Display', 'advanced-gutenberg')} width='100%' src={previewImageData}/>
                        :
                    <Fragment>
                        { inspectorControls }
                        <Placeholder
                            icon={ advRecentPostsBlockIcon }
                            label={ __( 'Content Display Block', 'advanced-gutenberg' ) }
                        >
                            { ! Array.isArray( recentPosts ) ?
                                <Spinner /> :
                                __( 'No posts found! Try to change filters or publish posts.', 'advanced-gutenberg' )
                            }
                        </Placeholder>
                    </Fragment>
                )
            }

            const postViewControls = [
                {
                    icon: 'grid-view',
                    title: __( 'Grid View', 'advanced-gutenberg' ),
                    onClick: () => setAttributes( { postView: 'grid' } ),
                    isActive: postView === 'grid',
                },
                {
                    icon: 'list-view',
                    title: __( 'List View', 'advanced-gutenberg' ),
                    onClick: () => setAttributes( { postView: 'list' } ),
                    isActive: postView === 'list',
                },
                {
                    icon: 'slides',
                    title: __( 'Slider View', 'advanced-gutenberg' ),
                    onClick: () => setAttributes( { postView: 'slider' } ),
                    isActive: postView === 'slider',
                },
                {
                    icon: 'table-row-before',
                    title: __( 'Frontpage View', 'advanced-gutenberg' ),
                    onClick: () => setAttributes( { postView: 'frontpage' } ),
                    isActive: postView === 'frontpage',
                },
                {
                    icon: 'admin-site-alt3',
                    title: __( 'Newspaper View', 'advanced-gutenberg' ),
                    onClick: () => {
                        setAttributes( { postView: 'newspaper' } );
                        this.newspaperOnChangeLayout(newspaperLayout);
                    },
                    isActive: postView === 'newspaper',
                },
                {
                    icon: 'tagcloud',
                    title: __( 'Masonry View', 'advanced-gutenberg' ),
                    onClick: () => setAttributes( { postView: 'masonry' } ),
                    isActive: postView === 'masonry',
                },
            ];

            const blockClassName = [
                'advgb-recent-posts-block',
                this.state.updating && 'loading',
                postView && postView + '-view',
                postView === 'list' && imagePosition !== 'left' && 'image-' + imagePosition,
                ( ( postView === 'grid' ) || ( postView === 'masonry' ) ) && 'columns-' + columns,
                postView === 'masonry' && 'tbl-columns-' + columnsT + ' ' + 'mbl-columns-' + columnsM,
                postView === 'slider' && sliderStyle && 'style-' + sliderStyle,
                postView === 'frontpage' && frontpageLayout && 'layout-' + frontpageLayout,
                postView === 'frontpage' && frontpageLayoutT && 'tbl-layout-' + frontpageLayoutT,
                postView === 'frontpage' && frontpageLayoutM && 'mbl-layout-' + frontpageLayoutM,
                ( ( postView === 'frontpage' ) || ( postView === 'masonry' ) ) && gap && 'gap-' + gap,
                postView === 'frontpage' && frontpageStyle && 'style-' + frontpageStyle,
                postView === 'newspaper' && newspaperLayout && 'layout-' + newspaperLayout,
            ].filter( Boolean ).join( ' ' );

            return (
                isPreview ?
                    <img alt={__('Content Display', 'advanced-gutenberg')} width='100%' src={previewImageData}/>
                    :
                <Fragment>
                    { inspectorControls }
                    <BlockControls>
                        <ToolbarGroup controls={ postViewControls } />
                        <ToolbarGroup>
                            <ToolbarButton
                                icon="update"
                                label={ __( 'Refresh', 'advanced-gutenberg' ) }
                                onClick={ () => setAttributes( { myToken: Math.floor(Math.random() * Math.floor(999)) } ) }
                            />
                        </ToolbarGroup>
                    </BlockControls>
                    <div className={ blockClassName }>
                        {this.state.updating && <div className="advgb-recent-posts-loading" />}
                        <div className="advgb-recent-posts">
                            {recentPosts.map( ( post, index ) => (
                                <article key={ index }
                                className={`advgb-recent-post ${ this.getDisplayImageStatus( attributes, index ) && ( post.featured_img || enablePlaceholderImage ) ? "" : "advgb-recent-post--no-image"}` }
                                >

                                    {(() => {
                                        if( this.getDisplayImageStatus( attributes, index ) && ( post.featured_img || enablePlaceholderImage ) ) {
                                            return(
                                                <div className="advgb-post-thumbnail">
                                                    <a href={ post.link } target="_blank">
                                                        <img src={ post.featured_img ? post.featured_img : advgbBlocks.post_thumb } alt={ __( 'Post Image', 'advanced-gutenberg' ) } />
                                                        {displayFeaturedImageCaption && post.featured_img_caption.length > 0 && (
                                                            <span class="advgb-post-caption">
                                                                { post.featured_img_caption }
                                                            </span>
                                                        )}
                                                    </a>
                                                </div>
                                            )
                                        } else if( ( postView === 'frontpage' && frontpageStyle === 'headline' ) || ( postView === 'slider' && sliderStyle === 'headline' ) ) {
                                            return (
                                                <div className="advgb-post-thumbnail advgb-post-thumbnail-no-image">
                                                    <a href={ post.link } target="_blank"></a>
                                                </div>
                                            )
                                        } else {
                                            { /* Nothing to do here */ }
                                        }
                                    })()}

                                    <div className="advgb-post-wrapper">
                                        <h2 className="advgb-post-title">
                                            <a href={ post.link } target="_blank">{ decodeEntities( post.title.rendered ) }</a>
                                        </h2>
                                        <RawHTML className="advgb-text-after-title">{ textAfterTitle }</RawHTML>
                                        <div className="advgb-post-info">
                                            {displayAuthor && post.coauthors && post.coauthors.length > 0 && post.coauthors.map( ( coauthor, coauthor_indx ) => (
                                                <Fragment>
                                                    <a href={ coauthor.link }
                                                       target="_blank"
                                                       className="advgb-post-author"
                                                    >
                                                        { coauthor.display_name }
                                                    </a>
                                                    {coauthor_indx < post.coauthors.length - 1 && (
                                                        <span>, </span>
                                                    ) }
                                                </Fragment>
                                            ) )
                                            }
                                            {displayAuthor && (!post.coauthors || post.coauthors.length === 0) && (
                                                <a href={ post.author_meta.author_link }
                                                   target="_blank"
                                                   className="advgb-post-author"
                                                >
                                                    { post.author_meta.display_name }
                                                </a>
                                            )
                                            }
                                            {postDate !== 'hide' && (
                                                <span className="advgb-post-datetime" >
                                                { this.getDateTime(post) }
                                                </span>
                                            ) }
                                            {postType === 'post' && displayCommentCount && (
                                                <span className="advgb-post-comments" >
                                                    <span class="dashicons dashicons-admin-comments"></span>
                                                    ({ post.comment_count })
                                                </span>
                                            ) }
                                        </div>
                                        <div className="advgb-post-tax-info">
                                            {showCategories !== 'hide' && post.tax_additional && post.tax_additional.categories && (
                                                <div className="advgb-post-tax advgb-post-category">
                                                {showCategories === 'show' && post.tax_additional.categories.unlinked.map( ( cat, index ) => (
                                                    <RawHTML>{ cat }</RawHTML>
                                                ) )}
                                                {showCategories === 'link' && post.tax_additional.categories.linked.map( ( cat, index ) => (
                                                    <RawHTML>{ cat }</RawHTML>
                                                ) )}
                                                </div>
                                            ) }
                                            {showTags !== 'hide' && post.tax_additional && post.tax_additional.tags && (
                                                <div className="advgb-post-tax advgb-post-tag">
                                                {showTags === 'show' && post.tax_additional.tags.unlinked.map( ( tag, index ) => (
                                                    <RawHTML>{ tag }</RawHTML>
                                                ) )}
                                                {showTags === 'link' && post.tax_additional.tags.linked.map( ( tag, index ) => (
                                                    <RawHTML>{ tag }</RawHTML>
                                                ) )}
                                                </div>
                                            ) }
                                            {! INBUILT_POST_TYPES.includes( postType ) && post.tax_additional && this.getTaxSlugs().map( (taxSlug) => (
                                                <div className={"advgb-post-tax advgb-post-cpt advgb-post-" + taxSlug}>
                                                {!linkCustomTax && post.tax_additional[taxSlug] && post.tax_additional[taxSlug].unlinked.map( ( tag, index ) => (
                                                    <RawHTML>{ tag }</RawHTML>
                                                ) )}
                                                {linkCustomTax && post.tax_additional[taxSlug] && post.tax_additional[taxSlug].linked.map( ( tag, index ) => (
                                                    <RawHTML>{ tag }</RawHTML>
                                                ) )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="advgb-post-content">
                                            {displayExcerpt && (
                                                <div className="advgb-post-excerpt"
                                                     dangerouslySetInnerHTML={ {
                                                         __html: postTextAsExcerpt ? RecentPostsEdit.extractContent(post.content.rendered, postTextExcerptLength) : (post.excerpt ? post.excerpt.raw : '')
                                                     } } />
                                            ) }
                                            <div className="advgb-text-before-readmore"><RawHTML>{ textBeforeReadmore }</RawHTML></div>
                                            {displayReadMore && (
                                                <div className="advgb-post-readmore">
                                                    <a href={ post.link } target="_blank">{ readMoreLbl ? readMoreLbl : __( 'Read More', 'advanced-gutenberg' ) }</a>
                                                </div>
                                            ) }
                                        </div>
                                    </div>
                                </article>
                            ) ) }
                        </div>
                    </div>
                </Fragment>
            )
        }

        static extractContent(html, length) {
            const span= document.createElement('span');
            span.innerHTML= html;

            // Remove script tag
            const scripts = span.getElementsByTagName('script');
            let j = scripts.length;
            while (j--) {
                scripts[j].parentNode.removeChild(scripts[j]);
            }

            // Remove style tag
            const styles = span.getElementsByTagName('style');
            let k = styles.length;
            while (k--) {
                styles[k].parentNode.removeChild(styles[k]);
            }

            const children= span.querySelectorAll('*');
            for(let i = 0 ; i < children.length ; i++) {
                if(children[i].textContent)
                    children[i].textContent += ' ';
                else
                    children[i].innerText += ' ';
            }

            let text = [span.textContent || span.innerText].toString().replace(/\s\s+/g,' ');
            text = text.slice(0, length).trim();

            if (text.length) text += '…' ;

            return text;
        };

        selectCategories(tokens) {
            const { categoriesList } = this.state;

            var hasNoSuggestion = tokens.some(function (token) {
                return typeof token === 'string' && !categoriesList[token];
            });

            if (hasNoSuggestion) {
                return;
            }

            var categories = tokens.map(function (token) {
                return typeof token === 'string' ? categoriesList[token] : token;
            })

            this.props.setAttributes({
                categories: categories,
            });
        }

        selectTags(tokens) {
            const { tagsList, tagNameVsId } = this.state;

            var hasNoSuggestion = tokens.some(function (token) {
                return typeof token === 'string' && !tagNameVsId[token];
            });

            if (hasNoSuggestion) {
                return;
            }

            var tags = tokens.map(function (token) {
                return typeof token === 'string' && tagNameVsId[token] ? token : token;
            })

            var tagIds = tokens.map(function (token) {
                return typeof token === 'string' ? tagNameVsId[token] : token.id;
            })

            this.props.setAttributes({
                tags: tags,
                tagIds: tagIds,
            });
        }

        getTagIdsForTags(tags) {
            const { tagNameVsId } = this.state;
            return tags.map( (tag) => {
                return tagNameVsId[tag];
            });
        }

        getCategoryForBkwrdCompat(id) {
            const { catIdVsName } = this.state;
            return {
                id: id,
                name: catIdVsName[id]
            };
        }

        selectPostByTitle(tokens, type) {
            const { postTitleVsIdMap } = this.state;

            var hasNoSuggestion = tokens.some(function (token) {
                return typeof token === 'string' && !postTitleVsIdMap[token];
            });

            if (hasNoSuggestion) {
                return;
            }

            var ids = tokens.map(function (token) {
                return typeof token === 'string' ? postTitleVsIdMap[token] : token.id;
            })

            const typeForQuery = type + 'Ids';
            this.props.setAttributes({ [type]: tokens, [typeForQuery]: ids });
        }

        updatePostType(postType) {
            this.setState( { taxonomyList: null } );
            if(! INBUILT_POST_TYPES.includes( postType )){
                this.generateTaxTerms( postType );
            }

            this.props.setAttributes( { postType: postType, exclude: [], excludeIds: [], updatePostSuggestions: true, showCustomTaxList: [], taxonomies: {} } );
        }

        /**
         * Generates taxonomy list for a post type and sets it in the state as "taxonomyList".
         */
        generateTaxTerms( postType ) {
            if(! postType){
                return;
            }

            // fetch all taxonomies
            wp.apiFetch( {
                path: wp.url.addQueryArgs( `wp/v2/types/${postType}`, { context: 'edit' } ),
            } ).then( ( typeAttributes ) => {
                let taxonomies = [];
                let taxIds = {};
                typeAttributes.taxonomies.forEach(tax => {
                    // fetch taxonomy attributes
                    wp.apiFetch( {
                        path: wp.url.addQueryArgs( `wp/v2/taxonomies/${tax}`, { context: 'edit' } ),
                    } ).then( ( taxAttributes ) => {
                        // fetch all terms
                        wp.apiFetch( {
                            path: wp.url.addQueryArgs( `wp/v2/${taxAttributes.rest_base}`, { context: 'edit' } ),
                        } ).then( ( terms ) => {
                            let suggestions = [];
                            let map = [];
                            terms.forEach(term => {
                                suggestions.push(decodeEntities(term.name));
                                map[ decodeEntities(term.name) ] = term.id;
                            });

                            const preselectedNames = this.props.attributes.taxonomies ? this.props.attributes.taxonomies[ tax ] : [];
                            if(preselectedNames){
                                let preselectedIds = preselectedNames.map(name => map[ name ] );
                                set( taxIds, tax, preselectedIds );
                                this.props.setAttributes( { taxIds: taxIds } );
                            }

                            taxonomies.push({ slug: tax, name: decodeEntities(taxAttributes.name), suggestions: suggestions, map: map, hierarchical: taxAttributes.hierarchical });

                            this.setState( { updating: true } );
                            if(typeAttributes.taxonomies.length === taxonomies.length){
                                // set state only when all taxonomies have been fetched
                                // otherwise the taxonomy boxes will appear one at a time making the page jittery
                                // we will sort the taxonomies so that the boxes are always in a predictable, consistent order
                                this.setState( { taxonomyList: sortBy(taxonomies, ['slug']), updating: false } );
                            }
                        } );
                    } );
                } );
            } );
        }

        /**
         * Populates the taxonomy terms in the suggestions box.
         */
        populateTaxTerms( tax ) {
            const { taxonomies } = this.props.attributes;
            return taxonomies && taxonomies[tax.slug];
        }

        /**
         * Selects the correct the taxonomy term from the suggestions and updates the "taxonomies" attribute.
         */
        selectTaxTerms( tax, tokens ) {
            var hasNoSuggestion = tokens.some(function (token) {
                return typeof token === 'string' && !tax.map[token];
            });

            if (hasNoSuggestion) {
                return;
            }

            var suggestions = tokens.map(function (token) {
                return typeof token === 'string' && tax.map[token] ? token : token;
            })

            var ids = tokens.map(function (token) {
                return typeof token === 'string' ? tax.map[token] : token.id;
            })

            let taxonomies = this.props.attributes.taxonomies || {};
            unset( taxonomies, tax.slug );
            if(suggestions){
                set( taxonomies, tax.slug, suggestions );
            }

            let taxIds = this.props.attributes.taxIds || {};
            unset( taxIds, tax.slug );
            if(ids){
                set( taxIds, tax.slug, ids );
            }

            this.props.setAttributes({
                taxonomies: taxonomies, // to save in the attributes
                [tax.slug]: suggestions, // to show in the select list
                taxIds: taxIds, // to send in the query
            });
        }

        /**
         * Selects the correct taxonomy from the suggestions and updates the "showCustomTaxList" attribute.
         */
        selectTaxonomies(tokens) {
            const { taxonomyList } = this.state;

            if( ! taxonomyList ) {
                return;
            }

            let taxList = taxonomyList && taxonomyList.length > 0 && taxonomyList.map( (tax) => decodeEntities(tax.name) );

            var hasNoSuggestion = tokens.some(function (token) {
                return typeof token === 'string' && !taxList.includes(token);
            });

            if (hasNoSuggestion) {
                return;
            }

            var taxes = tokens.map(function (token) {
                return typeof token === 'string' && taxList[token] ? token : token;
            })

            this.props.setAttributes({
                showCustomTaxList: taxes,
            });
        }

        /**
         * Returns the tax slugs corresponding to the tax names that appear in the suggestions.
         */
        getTaxSlugs() {
            const { taxonomyList } = this.state;
            const { showCustomTaxList } = this.props.attributes;
            if( ! taxonomyList || ! showCustomTaxList || showCustomTaxList.length === 0 ) {
                return [];
            }

            var slugs = showCustomTaxList.map( (taxName) => {
                var tax = find(taxonomyList, {name: decodeEntities(taxName)});
                if(tax){
                    return tax.slug;
                }
            });
            return slugs;
        }

        getDisplayImageStatus(attributes, index) {
            return(
                attributes.displayFeaturedImage && ( attributes.displayFeaturedImageFor === 'all' || index < attributes.displayFeaturedImageFor)
            )
        }

        refreshOnChangeItems(numberOfPosts) {
            const { postView, myToken } = this.props.attributes;
            this.props.setAttributes( { numberOfPosts: numberOfPosts } );

            if( postView === 'masonry' ){
                this.props.setAttributes( { myToken: Math.floor(Math.random() * Math.floor(999)) } );
            }
        }

        newspaperOnChangeLayout(newspaperLayout) {
            const { numberOfPosts } = this.props.attributes;
            const currentLayout = NEWSPAPER_LAYOUTS.find( layout => layout.layout === newspaperLayout );
            this.props.setAttributes( { numberOfPosts: currentLayout.items } );
        }

        getDateTime(post) {
            const { postDate, postDateFormat, displayTime } = this.props.attributes;

            if( postDateFormat === 'absolute' ) {
                if( postDate === 'created' ) {
                    return ( displayTime ? post.absolute_dates_time.created : post.absolute_dates.created );
                } else {
                    return ( displayTime ? post.absolute_dates_time.modified : post.absolute_dates.modified );
                }
            } else {
                return ( postDate === 'created' ? post.relative_dates.created : post.relative_dates.modified );
            }
        }

    }

    registerBlockType( 'advgb/recent-posts', {
        title: __( 'Content Display', 'advanced-gutenberg' ),
        description: __( 'Displays your content in grid, list, slider, frontpage, newspaper, and masonry views with beautiful layouts and styles.', 'advanced-gutenberg' ),
        icon: {
            src: advRecentPostsBlockIcon,
            foreground: typeof advgbBlocks !== 'undefined' ? advgbBlocks.color : undefined,
        },
        category: 'advgb-category',
        keywords: [
            __( 'recent posts', 'advanced-gutenberg' ),
            __( 'latest posts', 'advanced-gutenberg' ),
            __( 'posts slide', 'advanced-gutenberg' ),
            __( 'posts grid', 'advanced-gutenberg' ),
            __( 'posts', 'advanced-gutenberg' ),
            __( 'pages', 'advanced-gutenberg' )
        ],
        supports: {
            html: false,
        },
        example: {
            attributes: {
                isPreview: true
            },
        },
        edit: withSelect( ( select, props ) => {
            const { getEntityRecords } = select( 'core' );
            const { categories, tagIds, tags, category, order, orderBy, numberOfPosts, myToken, postType, excludeCurrentPost, excludeIds, author, taxonomies, taxIds, onlyFromCurrentUser } = props.attributes;

            const catIds = categories && categories.length > 0 ? categories.map( ( cat ) => cat.id ) : [];

            const postId = wp.data.select('core/editor').getCurrentPostId();
            const recentPostsQuery = pickBy( {
                categories: catIds,
                tags: tagIds,
                order,
                orderby: orderBy,
                per_page: numberOfPosts,
                token: myToken,
                exclude: excludeCurrentPost ? (excludeIds ? union( excludeIds, [ postId ] ) : postId ) : excludeIds,
                author: onlyFromCurrentUser ? wp.data.select('core').getCurrentUser().id : author,
            }, ( value ) => !isUndefined( value ) && !(isArray(value) && (isNull(value) || value.length === 0)) );

            let filterTaxNames = [];
            if(taxIds){
                Object.keys(taxIds).map(taxSlug => {
                    filterTaxNames.push(taxSlug);
                    recentPostsQuery[ taxSlug ] = taxIds[ taxSlug ];
                });
            }

            // generate posts without filters for post suggestions
            const postSuggestionsQuery = omit( recentPostsQuery, union( [ 'exclude', 'categories', 'tags', 'per_page' ], filterTaxNames ) );
            let updatePostSuggestions = props.attributes.updatePostSuggestions !== undefined ? props.attributes.updatePostSuggestions : true;

            return {
                recentPosts: getEntityRecords( 'postType', postType ? postType : 'post', recentPostsQuery ),
                postList: updatePostSuggestions ? getEntityRecords( 'postType', postType ? postType : 'post', postSuggestionsQuery ) : null,
                updatePostSuggestions: updatePostSuggestions,
            }
        } )( RecentPostsEdit ),
        save: function () { // Render in PHP
            return null;
        },
    } )
})( wp.i18n, wp.blocks, wp.element, wp.blockEditor, wp.components, wp.data, lodash, wp.htmlEntities, wp.date );
